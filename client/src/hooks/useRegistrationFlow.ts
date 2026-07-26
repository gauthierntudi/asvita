import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchAndDownloadCard } from '../api/cards';
import {
  buildRegistrationPayload,
  checkPaymentStatus,
  checkPhone,
  createPayment,
  mergeDraftIntoForms,
  saveDraft,
  submitCardPayment,
  type RegistrationForms,
} from '../api/registration';
import { FORM_IDS, getNextRegistrationStep, getPrevRegistrationStep } from '../config/registrationFlow';
import { PAYMENT_FAILURE_MESSAGES } from '../types/paymentResult';
import {
  initialStepFiveForm,
  initialStepFourForm,
  initialStepOneForm,
  initialStepThreeForm,
  initialStepTwoForm,
} from '../types/registration';
import type { PaymentResultData } from '../types/paymentResult';
import { clearPaymentReturnParams, parsePaymentReturnFromUrl } from '../utils/paymentReturn';
import { isValidFlexpayDrcPhone } from '../utils/phone';

export function useRegistrationFlow() {
  const [currentStep, setCurrentStep] = useState(2);
  const [stepOne, setStepOne] = useState(initialStepOneForm);
  const [stepTwo, setStepTwo] = useState(initialStepTwoForm);
  const [stepThree, setStepThree] = useState(initialStepThreeForm);
  const [stepFour, setStepFour] = useState(initialStepFourForm);
  const [stepFive, setStepFive] = useState(initialStepFiveForm);
  const [paymentResult, setPaymentResult] = useState<PaymentResultData | null>(null);
  const [loading, setLoading] = useState<{ title: string; description: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCancelledRef = useRef(false);

  const isBusy = loading !== null;
  const showPrevNext = currentStep >= 3;
  const isLastStep = currentStep === 6;
  const activeFormId = FORM_IDS[currentStep] ?? FORM_IDS[2];
  const isContactStep = currentStep === 3;

  const stopPolling = () => {
    pollCancelledRef.current = true;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    const returnResult = parsePaymentReturnFromUrl();
    if (!returnResult) {
      return;
    }

    if (returnResult.status !== 'success') {
      setPaymentResult(returnResult);
      clearPaymentReturnParams();
      return;
    }

    const paymentKey = returnResult.orderNumber ?? returnResult.paymentReference;
    if (!paymentKey) {
      setPaymentResult(returnResult);
      clearPaymentReturnParams();
      return;
    }

    let cancelled = false;

    const resolvePaidReturn = async () => {
      for (let attempt = 0; attempt < 12; attempt += 1) {
        try {
          const status = await checkPaymentStatus(paymentKey);
          if (status.success && status.status === 'paid') {
            if (!cancelled) {
              setPaymentResult({
                status: 'success',
                orderNumber: returnResult.orderNumber ?? paymentKey,
                paymentReference: returnResult.paymentReference,
                memberNumber: status.memberNumber,
                cardDownloadUrl: status.cardDownloadUrl,
                cardDownloadToken: status.cardDownloadToken,
              });
              clearPaymentReturnParams();
            }
            return;
          }
        } catch {
          // Retry shortly while webhook/finalization completes.
        }

        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }

      if (!cancelled) {
        setPaymentResult({
          status: 'success',
          orderNumber: returnResult.orderNumber ?? paymentKey,
          paymentReference: returnResult.paymentReference,
        });
        clearPaymentReturnParams();
      }
    };

    void resolvePaidReturn();

    return () => {
      cancelled = true;
    };
  }, []);

  const buildPayload = () =>
    buildRegistrationPayload(stepOne, stepTwo, stepThree, stepFour, stepFive);

  const applyForms = (forms: ReturnType<typeof mergeDraftIntoForms>) => {
    setStepOne(forms.stepOne);
    setStepTwo(forms.stepTwo);
    setStepThree(forms.stepThree);
    setStepFour(forms.stepFour);
    setStepFive(forms.stepFive);
  };

  const getCurrentForms = () => ({
    stepOne,
    stepTwo,
    stepThree,
    stepFour,
    stepFive,
  });

  const verifyPhoneAndRestoreDraft = async (
    phone: string,
    forms: RegistrationForms,
  ): Promise<
    | { status: 'new' }
    | { status: 'restored'; forms: RegistrationForms }
    | { status: 'paid'; message: string }
    | { status: 'error' }
  > => {
    if (!phone || !isValidFlexpayDrcPhone(phone)) {
      return { status: 'new' };
    }

    try {
      const result = await checkPhone(phone);

      if (result.success && result.exists && 'is_paid' in result && result.is_paid) {
        return {
          status: 'paid',
          message: result.message || 'Ce numéro est déjà utilisé.',
        };
      }

      if (result.success && result.exists && 'data' in result && result.data) {
        const merged = mergeDraftIntoForms(forms, result.data);
        return { status: 'restored', forms: merged };
      }

      return { status: 'new' };
    } catch (error) {
      console.error('check-phone failed:', error);
      return { status: 'error' };
    }
  };

  const saveDraftQuietly = async (forms = getCurrentForms()) => {
    if (!forms.stepOne.phone) return;
    try {
      await saveDraft(
        buildRegistrationPayload(
          forms.stepOne,
          forms.stepTwo,
          forms.stepThree,
          forms.stepFour,
          forms.stepFive,
        ),
      );
    } catch {
      // Sauvegarde silencieuse — ne bloque pas la navigation
    }
  };

  const handleRegister = async () => {
    if (isBusy) return;

    if (stepFive.paymentType === '1') {
      const paymentPhone = stepFive.paymentPhone || stepOne.phone;
      if (!isValidFlexpayDrcPhone(paymentPhone)) {
        setPaymentResult({
          status: 'failed',
          message:
            'Numéro Mobile Money invalide. Vérifiez le numéro à facturer (ex. 0812345678).',
        });
        return;
      }
    }

    pollCancelledRef.current = false;
    setLoading({
      title: 'Génération du paiement...',
      description: 'Veuillez patienter pendant la connexion sécurisée.',
    });

    try {
      const result = await createPayment(buildPayload());

      if (!result.success) {
        setPaymentResult({ status: 'failed', message: result.message });
        setLoading(null);
        return;
      }

      if (result.is_redirect) {
        submitCardPayment(result.url, result.params);
        return;
      }

      setLoading({
        title: 'Validation en attente...',
        description:
          result.message ||
          'Consultez votre téléphone (push ou code USSD) et entrez votre PIN pour valider.',
      });

      const orderNumber = result.orderNumber;
      let attempts = 0;

      const pollOnce = async () => {
        if (pollCancelledRef.current) return;

        attempts += 1;

        if (attempts >= 60) {
          stopPolling();
          setLoading(null);
          setPaymentResult({
            status: 'failed',
            message:
              "Délai d'attente dépassé. Aucune confirmation reçue. Vérifiez votre solde et réessayez.",
          });
          return;
        }

        try {
          const status = await checkPaymentStatus(orderNumber);

          if (status.success && status.status === 'paid') {
            stopPolling();
            setLoading(null);
            setPaymentResult({
              status: 'success',
              orderNumber,
              memberNumber: status.memberNumber,
              cardDownloadUrl: status.cardDownloadUrl,
              cardDownloadToken: status.cardDownloadToken,
            });
          } else if (status.success && status.status === 'failed') {
            stopPolling();
            setLoading(null);
            setPaymentResult({
              status: 'failed',
              message: status.message ?? PAYMENT_FAILURE_MESSAGES.default,
            });
          }
        } catch {
          // Continuer le polling
        }
      };

      await pollOnce();
      if (!pollCancelledRef.current) {
        pollRef.current = setInterval(pollOnce, 5000);
      }
    } catch {
      stopPolling();
      setLoading(null);
      setPaymentResult({
        status: 'failed',
        message: "Une erreur technique s'est produite lors du contact avec le serveur.",
      });
    }
  };

  const handleCancelPayment = () => {
    stopPolling();
    setLoading(null);
  };

  const handlePaymentRetry = () => {
    setPaymentResult(null);
    setCurrentStep(6);
  };

  const handleNext = async () => {
    if (isBusy) return;

    setLoading({
      title: 'Chargement...',
      description: 'Sauvegarde de vos informations en cours.',
    });

    try {
      await saveDraftQuietly();
      setCurrentStep((step) => getNextRegistrationStep(step));
    } finally {
      setLoading(null);
    }
  };

  const handleIdentityNext = async () => {
    if (isBusy) return;

    const forms = getCurrentForms();

    setLoading({
      title: 'Vérification...',
      description: 'Vérification de votre numéro de téléphone.',
    });

    try {
      const result = await verifyPhoneAndRestoreDraft(forms.stepOne.phone, forms);

      if (result.status === 'paid') {
        toast.error(result.message || 'Ce numéro est déjà utilisé.');
        return;
      }

      if (result.status === 'error') {
        setLoading({
          title: 'API indisponible',
          description:
            'Impossible de contacter le serveur. Lancez "npm run dev" à la racine, puis réessayez.',
        });
        return;
      }

      const nextForms = result.status === 'restored' ? result.forms : forms;

      setLoading({
        title: 'Chargement...',
        description: 'Sauvegarde de vos informations en cours.',
      });

      applyForms(nextForms);
      await saveDraftQuietly(nextForms);
      setCurrentStep(3);
    } finally {
      setLoading((current) =>
        current?.title === 'API indisponible' ? current : null,
      );
    }
  };

  const dismissLoading = () => setLoading(null);

  const handleDownloadCard = async () => {
    if (!paymentResult || paymentResult.status !== 'success') {
      return;
    }

    try {
      if (paymentResult.cardDownloadToken) {
        await fetchAndDownloadCard(
          { token: paymentResult.cardDownloadToken },
          paymentResult.memberNumber
            ? `carte-vita-${paymentResult.memberNumber}.png`
            : 'carte-vita.png',
        );
        return;
      }

      const paymentKey = paymentResult.orderNumber ?? paymentResult.paymentReference;
      if (paymentKey) {
        await fetchAndDownloadCard(
          { order: paymentKey },
          paymentResult.memberNumber
            ? `carte-vita-${paymentResult.memberNumber}.png`
            : 'carte-vita.png',
        );
        return;
      }

      if (paymentResult.memberNumber) {
        await fetchAndDownloadCard(
          { fanId: paymentResult.memberNumber },
          `carte-vita-${paymentResult.memberNumber}.png`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Impossible de télécharger votre carte pour le moment.';
      toast.error(message);
    }
  };

  const handlePrev = () => {
    setCurrentStep((step) => getPrevRegistrationStep(step));
  };

  const handleStepOneChange = (patch: Partial<typeof stepOne>) => {
    setStepOne((prev) => ({ ...prev, ...patch }));
  };

  return {
    currentStep,
    stepOne,
    stepTwo,
    stepThree,
    stepFour,
    stepFive,
    setStepTwo,
    setStepThree,
    setStepFour,
    setStepFive,
    paymentResult,
    loading,
    isBusy,
    showPrevNext,
    isLastStep,
    activeFormId,
    isContactStep,
    handleRegister,
    handleCancelPayment,
    handlePaymentRetry,
    handleNext,
    handleIdentityNext,
    handlePrev,
    handleStepOneChange,
    dismissLoading,
    handleDownloadCard,
  };
}

export type RegistrationFlow = ReturnType<typeof useRegistrationFlow>;
