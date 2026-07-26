import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Download,
  Eye,
  IdCard,
  LogOut,
  Percent,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  clearAdminToken,
  deleteAdminSupporter,
  fetchAdminMetrics,
  fetchAdminSupporters,
  reactivateAdminSupporter,
  type AdminMetrics,
  type AdminSupporter,
} from '../api/admin';
import '../styles/admin.css';

type AdminDashboardPageProps = {
  onLogout: () => void;
};

function formatName(row: AdminSupporter): string {
  return [row.lastname, row.middlename, row.firstname].filter(Boolean).join(' ') || '—';
}

function formatMoney(amount: string | null, currency: string | null): string {
  if (!amount) return '—';
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${amount} ${currency || ''}`.trim();
  return `${value.toLocaleString('fr-FR')}${currency ? ` ${currency}` : ''}`;
}

function statusLabel(status: string | null): string {
  if (status === 'paid') return 'Payé';
  if (status === 'pending') return 'En attente';
  if (status === 'failed') return 'Échec';
  return 'Sans paiement';
}

function memberTypeLabel(type: string | null): string {
  if (type === 'simple') return 'Standard';
  if (type === 'premium') return 'Premium';
  return type || '—';
}

const ADMIN_PER_PAGE = 15;

function pageWindow(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  for (const page of sorted) {
    const prev = result[result.length - 1];
    if (typeof prev === 'number' && page - prev > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  }
  return result;
}

function initials(row: AdminSupporter): string {
  const a = (row.firstname || row.lastname || '?').trim().charAt(0);
  const b = (row.lastname || row.firstname || '').trim().charAt(0);
  return `${a}${b}`.toUpperCase();
}

function exportCsv(rows: AdminSupporter[]) {
  const headers = [
    'id',
    'nom',
    'telephone',
    'fan_id',
    'type',
    'section',
    'ville',
    'statut',
    'montant',
    'devise',
    'reference',
    'date',
  ];
  const lines = rows.map((row) =>
    [
      row.id,
      formatName(row),
      row.phone || '',
      row.memberNumber || '',
      memberTypeLabel(row.memberType),
      row.section || '',
      row.city || '',
      row.paymentStatus || '',
      row.paymentAmount || '',
      row.paymentCurrency || '',
      row.paymentReference || '',
      row.createdAt,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  );
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `asvita-inscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboardPage({ onLogout }: AdminDashboardPageProps) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [items, setItems] = useState<AdminSupporter[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [memberType, setMemberType] = useState('all');
  const [activity, setActivity] = useState('active');
  const [selected, setSelected] = useState<AdminSupporter | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reactivatingId, setReactivatingId] = useState<number | null>(null);

  const load = useCallback(
    async (
      nextPage: number,
      filters: { q: string; status: string; memberType: string; activity: string },
    ) => {
      setLoading(true);
      try {
        const [metricsData, listData] = await Promise.all([
          fetchAdminMetrics(),
          fetchAdminSupporters({
            page: nextPage,
            q: filters.q,
            status: filters.status,
            memberType: filters.memberType,
            activity: filters.activity,
          }),
        ]);
        setMetrics(metricsData);
        setItems(listData.items);
        setPage(listData.page);
        setTotalPages(listData.totalPages);
        setTotal(listData.total);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Chargement impossible');
        clearAdminToken();
        onLogout();
      } finally {
        setLoading(false);
      }
    },
    [onLogout],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(1, { q: q.trim(), status, memberType, activity });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [q, status, memberType, activity, load]);

  const handleDelete = async (row: AdminSupporter) => {
    const label = formatName(row);
    if (
      !window.confirm(
        `Désactiver ${label} ? Le compte restera en base et pourra être réactivé.`,
      )
    ) {
      return;
    }

    setDeletingId(row.id);
    try {
      await deleteAdminSupporter(row.id);
      toast.success('Supporter désactivé');
      if (selected?.id === row.id) setSelected(null);
      await load(page, { q: q.trim(), status, memberType, activity });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Désactivation impossible');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReactivate = async (row: AdminSupporter) => {
    setReactivatingId(row.id);
    try {
      await reactivateAdminSupporter(row.id);
      toast.success('Supporter réactivé');
      if (selected?.id === row.id) {
        setSelected({ ...row, deletedAt: null });
      }
      await load(page, { q: q.trim(), status, memberType, activity });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Réactivation impossible');
    } finally {
      setReactivatingId(null);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    onLogout();
  };

  const metricCards = useMemo(
    () => [
      {
        key: 'total',
        label: 'Supporters',
        value: metrics?.totalSupporters ?? '—',
        hint: 'Total inscrits',
        icon: Users,
        tone: 'green',
      },
      {
        key: 'paid',
        label: 'Payés',
        value: metrics?.paidCount ?? '—',
        hint: `${metrics?.conversionRate ?? 0}% de conversion`,
        icon: CheckCircle2,
        tone: 'blue',
      },
      {
        key: 'pending',
        label: 'En attente',
        value: metrics?.pendingCount ?? '—',
        hint: `${metrics?.failedCount ?? 0} échecs`,
        icon: Clock3,
        tone: 'orange',
      },
      {
        key: 'premium',
        label: 'Premium',
        value: metrics?.premiumCount ?? '—',
        hint: 'Cartes premium',
        icon: Crown,
        tone: 'gold',
      },
      {
        key: 'simple',
        label: 'Standard',
        value: metrics?.simpleCount ?? '—',
        hint: 'Cartes standard',
        icon: IdCard,
        tone: 'cyan',
      },
      {
        key: 'usd',
        label: 'Revenus USD',
        value: metrics
          ? metrics.revenueUsd.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
          : '—',
        hint: 'Paiements confirmés',
        icon: Banknote,
        tone: 'rose',
      },
      {
        key: 'cdf',
        label: 'Revenus CDF',
        value: metrics ? metrics.revenueCdf.toLocaleString('fr-FR') : '—',
        hint: 'Paiements confirmés',
        icon: Percent,
        tone: 'navy',
      },
    ],
    [metrics],
  );

  return (
    <div className="admin-dash">
      <div className="admin-dash__container">
      <header className="admin-dash__header">
        <div className="admin-dash__brand">
          <img src="/img/icon-new.png" alt="" className="admin-dash__logo" />
          <div>
            <p className="admin-dash__eyebrow">AS Vita Club</p>
            <h1>Tableau de bord</h1>
            <p className="admin-dash__subtitle">Suivi des inscriptions et paiements supporters</p>
          </div>
        </div>
        <div className="admin-dash__actions">
          <button
            type="button"
            className="admin-dash__ghost"
            onClick={() => void load(page, { q: q.trim(), status, memberType, activity })}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
          <button
            type="button"
            className="admin-dash__ghost"
            onClick={() => exportCsv(items)}
            disabled={items.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            type="button"
            className="admin-dash__logout"
            onClick={handleLogout}
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="admin-dash__metrics">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.key} className={`admin-metric admin-metric--${card.tone}`}>
              <div className="admin-metric__icon">
                <Icon size={18} />
              </div>
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.hint}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-dash__table-wrap">
        <div className="admin-dash__toolbar">
          <div className="admin-dash__toolbar-title">
            <h2>Inscriptions</h2>
            <p>
              {total} résultat{total > 1 ? 's' : ''}
            </p>
          </div>
          <div className="admin-dash__filters">
            <label className="admin-dash__search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Nom, téléphone, FAN ID…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="paid">Payé</option>
              <option value="pending">En attente</option>
              <option value="failed">Échec</option>
              <option value="none">Sans paiement</option>
            </select>
            <select value={memberType} onChange={(e) => setMemberType(e.target.value)}>
              <option value="all">Tous les types</option>
              <option value="simple">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="active">Actifs</option>
              <option value="deleted">Désactivés</option>
              <option value="all">Tous</option>
            </select>
          </div>
        </div>

        <div className="admin-dash__table-scroll">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>Supporter</th>
                <th>Contact</th>
                <th>FAN ID</th>
                <th>Type</th>
                <th>Paiement</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className={row.deletedAt ? 'is-deleted' : undefined}>
                  <td>
                    <div className="admin-person">
                      <span className="admin-person__avatar">{initials(row)}</span>
                      <div>
                        <strong>{formatName(row)}</strong>
                        <small>
                          {row.deletedAt ? 'Désactivé · ' : ''}
                          {row.section || row.city || '—'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{row.phone || '—'}</td>
                  <td>
                    <code>{row.memberNumber || '—'}</code>
                  </td>
                  <td>
                    <span className={`admin-type admin-type--${row.memberType || 'none'}`}>
                      {memberTypeLabel(row.memberType)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${row.paymentStatus || 'none'}`}>
                      {statusLabel(row.paymentStatus)}
                    </span>
                  </td>
                  <td>{formatMoney(row.paymentAmount, row.paymentCurrency)}</td>
                  <td>{new Date(row.createdAt).toLocaleString('fr-FR')}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" title="Détails" onClick={() => setSelected(row)}>
                        <Eye size={16} />
                      </button>
                      {row.deletedAt ? (
                        <button
                          type="button"
                          title="Réactiver"
                          className="is-reactivate"
                          disabled={reactivatingId === row.id}
                          onClick={() => void handleReactivate(row)}
                        >
                          <RotateCcw size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Désactiver"
                          className="is-danger"
                          disabled={deletingId === row.id}
                          onClick={() => void handleDelete(row)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-dash__empty">
                    Aucune inscription ne correspond à ces filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {loading ? <div className="admin-dash__loading-bar">Chargement des données…</div> : null}

        <div className="admin-dash__pager">
          <p className="admin-dash__pager-info">
            {total === 0
              ? 'Aucun résultat'
              : `${(page - 1) * ADMIN_PER_PAGE + 1}–${Math.min(page * ADMIN_PER_PAGE, total)} sur ${total}`}
          </p>

          <div className="admin-dash__pager-controls">
            <button
              type="button"
              className="admin-dash__pager-nav"
              disabled={page <= 1 || loading}
              onClick={() => void load(page - 1, { q: q.trim(), status, memberType, activity })}
              aria-label="Page précédente"
            >
              <ChevronLeft size={18} />
              <span>Préc.</span>
            </button>

            <div className="admin-dash__pager-pages" role="navigation" aria-label="Pagination">
              {pageWindow(page, Math.max(totalPages, 1)).map((item, index) =>
                item === 'ellipsis' ? (
                  <span key={`e-${index}`} className="admin-dash__pager-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={
                      item === page
                        ? 'admin-dash__pager-page is-active'
                        : 'admin-dash__pager-page'
                    }
                    disabled={loading}
                    onClick={() => {
                      if (item !== page) {
                        void load(item, { q: q.trim(), status, memberType, activity });
                      }
                    }}
                    aria-current={item === page ? 'page' : undefined}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              className="admin-dash__pager-nav"
              disabled={page >= totalPages || loading || total === 0}
              onClick={() => void load(page + 1, { q: q.trim(), status, memberType, activity })}
              aria-label="Page suivante"
            >
              <span>Suiv.</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
      </div>

      {selected ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-modal__backdrop"
            aria-label="Fermer"
            onClick={() => setSelected(null)}
          />
          <div className="admin-modal__panel">
            <header className="admin-modal__header">
              <div>
                <p className="admin-dash__eyebrow">Fiche supporter</p>
                <h2>{formatName(selected)}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Fermer">
                <X size={18} />
              </button>
            </header>

            <div className="admin-modal__grid">
              <div>
                <span>FAN ID</span>
                <strong>{selected.memberNumber || '—'}</strong>
              </div>
              <div>
                <span>Téléphone</span>
                <strong>{selected.phone || '—'}</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{memberTypeLabel(selected.memberType)}</strong>
              </div>
              <div>
                <span>Section</span>
                <strong>{selected.section || '—'}</strong>
              </div>
              <div>
                <span>Sexe</span>
                <strong>{selected.gender || '—'}</strong>
              </div>
              <div>
                <span>Tranche d’âge</span>
                <strong>{selected.ageRange || '—'}</strong>
              </div>
              <div>
                <span>Ville</span>
                <strong>
                  {[selected.city, selected.town, selected.province].filter(Boolean).join(' · ') ||
                    '—'}
                </strong>
              </div>
              <div>
                <span>Occupation</span>
                <strong>{selected.occupation || '—'}</strong>
              </div>
              <div>
                <span>Statut paiement</span>
                <strong>{statusLabel(selected.paymentStatus)}</strong>
              </div>
              <div>
                <span>Montant</span>
                <strong>{formatMoney(selected.paymentAmount, selected.paymentCurrency)}</strong>
              </div>
              <div>
                <span>Référence</span>
                <strong>{selected.paymentReference || '—'}</strong>
              </div>
              <div>
                <span>FlexPay</span>
                <strong>{selected.flexpayReference || '—'}</strong>
              </div>
              <div className="admin-modal__full">
                <span>Inscrit le</span>
                <strong>{new Date(selected.createdAt).toLocaleString('fr-FR')}</strong>
              </div>
              <div className="admin-modal__full">
                <span>Compte</span>
                <strong>
                  {selected.deletedAt
                    ? `Désactivé le ${new Date(selected.deletedAt).toLocaleString('fr-FR')}`
                    : 'Actif'}
                </strong>
              </div>
            </div>

            <footer className="admin-modal__footer">
              <button type="button" className="admin-dash__ghost" onClick={() => setSelected(null)}>
                Fermer
              </button>
              {selected.deletedAt ? (
                <button
                  type="button"
                  className="admin-dash__reactivate"
                  disabled={reactivatingId === selected.id}
                  onClick={() => void handleReactivate(selected)}
                >
                  <RotateCcw size={16} />
                  Réactiver
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-dash__danger"
                  disabled={deletingId === selected.id}
                  onClick={() => void handleDelete(selected)}
                >
                  <Trash2 size={16} />
                  Désactiver
                </button>
              )}
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
