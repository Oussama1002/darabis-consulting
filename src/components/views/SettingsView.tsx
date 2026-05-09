import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Settings,
  Building2,
  FileLock2,
  BellRing,
  CreditCard,
  Languages,
  Globe,
  Save,
  Landmark,
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';

const STORAGE_KEY = 'darbis-app-settings';

export type SettingsSectionId = 'company' | 'billing' | 'payments' | 'notifications' | 'locale';

export interface DarbisAppSettings {
  company: {
    legalName: string;
    taxId: string;
    ice: string;
    address: string;
    logoDataUrl: string | null;
  };
  billing: {
    defaultTaxRatePercent: number;
    paymentTermsDays: number;
    invoicePrefix: string;
    quotePrefix: string;
    footerLegalText: string;
  };
  banking: {
    bankName: string;
    iban: string;
    bic: string;
    accountHolder: string;
    includeRIBOnPDF: boolean;
  };
  notifications: {
    autoReminders: boolean;
    ribOnInvoice: boolean;
    notifyAdminOnPayment: boolean;
    digestEmail: string;
  };
  locale: {
    language: 'fr' | 'ar';
    timezone: string;
    weekStartsOn: 'monday' | 'sunday';
  };
}

const defaultSettings = (): DarbisAppSettings => ({
  company: {
    legalName: 'Bureau Darbis Consulting',
    taxId: '12345678',
    ice: '0011223344556677',
    address: 'Anfa Place, Casablanca, Maroc',
    logoDataUrl: null,
  },
  billing: {
    defaultTaxRatePercent: 20,
    paymentTermsDays: 30,
    invoicePrefix: 'FACT',
    quotePrefix: 'DEV',
    footerLegalText: 'Conditions : paiement à réception. TVA selon réglementation en vigueur.',
  },
  banking: {
    bankName: 'Attijariwafa bank',
    iban: 'MA00 0000 0000 0000 0000 0000 000',
    bic: 'BCMAMAMC',
    accountHolder: 'Bureau Darbis Consulting SARL',
    includeRIBOnPDF: true,
  },
  notifications: {
    autoReminders: true,
    ribOnInvoice: true,
    notifyAdminOnPayment: false,
    digestEmail: 'notifications@darbis.ma',
  },
  locale: {
    language: 'fr',
    timezone: 'Africa/Casablanca',
    weekStartsOn: 'monday',
  },
});

function loadSettings(): DarbisAppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<DarbisAppSettings>;
    const base = defaultSettings();
    return {
      company: { ...base.company, ...parsed.company },
      billing: { ...base.billing, ...parsed.billing },
      banking: { ...base.banking, ...parsed.banking },
      notifications: { ...base.notifications, ...parsed.notifications },
      locale: { ...base.locale, ...parsed.locale },
    };
  } catch {
    return defaultSettings();
  }
}

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={cn(
        'w-12 h-6 rounded-full relative transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-darbis-blue/40',
        checked ? 'bg-darbis-green' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
          checked ? 'left-7' : 'left-1'
        )}
      />
    </button>
  );
}

const sidebarItems: { id: SettingsSectionId; label: string; icon: typeof Building2 }[] = [
  { id: 'company', label: 'Informations Société', icon: Building2 },
  { id: 'billing', label: 'Facturation & Taxes', icon: FileLock2 },
  { id: 'payments', label: 'Paiements & RIB', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
  { id: 'locale', label: 'Langue & Région', icon: Languages },
];

export const SettingsView: React.FC = () => {
  const { toast } = useToast();
  const [section, setSection] = useState<SettingsSectionId>('company');
  const [settings, setSettings] = useState<DarbisAppSettings>(() => loadSettings());

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = useCallback(<K extends keyof DarbisAppSettings>(key: K, patch: Partial<DarbisAppSettings[K]>) => {
    setSettings((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast('Paramètres enregistrés sur cet appareil');
    } catch {
      toast('Impossible d’enregistrer (stockage plein ou privé)', 'error');
    }
  };

  const onLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 400 * 1024) {
      toast('Image trop volumineuse (max. 400 Ko)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      update('company', { logoDataUrl: dataUrl });
      toast('Logo mis à jour (pensez à enregistrer)');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2';
  const inputClass =
    'w-full min-h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-darbis-blue/30 transition-all text-sm';

  const panelTitle = useMemo(() => sidebarItems.find((s) => s.id === section)?.label ?? 'Paramètres', [section]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-darbis-blue" />
            Paramètres du système
          </h2>
          <p className="text-slate-500 text-sm">
            Configurez l’identité, la facturation, le RIB et les préférences. Les données sont stockées localement dans le navigateur.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="bg-darbis-blue text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:opacity-95 transition-all shadow-lg active:scale-[0.98]"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left',
                section === item.id
                  ? 'bg-white text-darbis-blue shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 space-y-8">
          <div className="premium-card p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2 border-b border-slate-50 pb-4">{panelTitle}</h3>

            {section === 'company' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Dénomination sociale</label>
                    <input
                      type="text"
                      value={settings.company.legalName}
                      onChange={(e) => update('company', { legalName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Identifiant fiscal (IF)</label>
                    <input
                      type="text"
                      value={settings.company.taxId}
                      onChange={(e) => update('company', { taxId: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>ICE</label>
                    <input
                      type="text"
                      value={settings.company.ice}
                      onChange={(e) => update('company', { ice: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Logo officiel</label>
                    <div className="flex gap-4 items-start">
                      <label className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200/50 cursor-pointer transition-all overflow-hidden shrink-0 relative">
                        {settings.company.logoDataUrl ? (
                          <img src={settings.company.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <>
                            <Globe className="w-8 h-8 mb-2 opacity-20" />
                            <span className="text-[10px] font-bold uppercase">Importer</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onLogoSelect} />
                      </label>
                      <div className="flex-1 text-xs text-slate-500 space-y-2">
                        <p>PNG, JPG ou WEBP — max. 400 Ko. Stocké avec les paramètres.</p>
                        {settings.company.logoDataUrl && (
                          <button
                            type="button"
                            className="text-red-600 font-bold hover:underline"
                            onClick={() => update('company', { logoDataUrl: null })}
                          >
                            Retirer le logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Adresse du siège</label>
                    <textarea
                      rows={3}
                      value={settings.company.address}
                      onChange={(e) => update('company', { address: e.target.value })}
                      className={cn(inputClass, 'py-3 min-h-[96px] resize-y')}
                    />
                  </div>
                </div>
              </div>
            )}

            {section === 'billing' && (
              <div className="space-y-6 pt-6 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>TVA par défaut (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={settings.billing.defaultTaxRatePercent}
                      onChange={(e) => update('billing', { defaultTaxRatePercent: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Délai de paiement (jours)</label>
                    <input
                      type="number"
                      min={0}
                      max={365}
                      value={settings.billing.paymentTermsDays}
                      onChange={(e) => update('billing', { paymentTermsDays: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Préfixe factures</label>
                    <input
                      type="text"
                      value={settings.billing.invoicePrefix}
                      onChange={(e) => update('billing', { invoicePrefix: e.target.value })}
                      className={inputClass}
                      placeholder="FACT"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Préfixe devis</label>
                    <input
                      type="text"
                      value={settings.billing.quotePrefix}
                      onChange={(e) => update('billing', { quotePrefix: e.target.value })}
                      className={inputClass}
                      placeholder="DEV"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Mentions légales pied de page (factures / PDF)</label>
                  <textarea
                    rows={4}
                    value={settings.billing.footerLegalText}
                    onChange={(e) => update('billing', { footerLegalText: e.target.value })}
                    className={cn(inputClass, 'py-3 min-h-[100px]')}
                  />
                </div>
              </div>
            )}

            {section === 'payments' && (
              <div className="space-y-6 pt-6 max-w-xl">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Landmark className="w-5 h-5 text-darbis-blue shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">
                    Ces informations peuvent être reportées sur vos documents si vous activez l’option ci-dessous et dans les notifications.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Banque</label>
                  <input
                    type="text"
                    value={settings.banking.bankName}
                    onChange={(e) => update('banking', { bankName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>IBAN</label>
                  <input
                    type="text"
                    value={settings.banking.iban}
                    onChange={(e) => update('banking', { iban: e.target.value })}
                    className={inputClass}
                    placeholder="MA00 …"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>BIC / SWIFT</label>
                    <input
                      type="text"
                      value={settings.banking.bic}
                      onChange={(e) => update('banking', { bic: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Titulaire du compte</label>
                    <input
                      type="text"
                      value={settings.banking.accountHolder}
                      onChange={(e) => update('banking', { accountHolder: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">Inclure le RIB sur les factures / PDF</span>
                  <Toggle
                    checked={settings.banking.includeRIBOnPDF}
                    onChange={(v) => update('banking', { includeRIBOnPDF: v })}
                  />
                </div>
              </div>
            )}

            {section === 'notifications' && (
              <div className="space-y-6 pt-6 max-w-xl">
                <div>
                  <label className={labelClass}>E-mail pour alertes et récapitulatifs</label>
                  <input
                    type="email"
                    value={settings.notifications.digestEmail}
                    onChange={(e) => update('notifications', { digestEmail: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-3">
                  {[
                    {
                      key: 'autoReminders' as const,
                      label: 'Activer les rappels automatiques (relances clients)',
                    },
                    {
                      key: 'ribOnInvoice' as const,
                      label: 'Afficher les coordonnées bancaires sur les envois par e-mail',
                    },
                    {
                      key: 'notifyAdminOnPayment' as const,
                      label: 'Notifier l’administrateur à chaque encaissement',
                    },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700 pr-4">{label}</span>
                      <Toggle
                        checked={settings.notifications[key]}
                        onChange={(v) => update('notifications', { [key]: v })}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Dans cette démo, aucun e-mail n’est envoyé : les options préparent un futur branchement SMTP / SMS.
                </p>
              </div>
            )}

            {section === 'locale' && (
              <div className="space-y-6 pt-6 max-w-xl">
                <div>
                  <label className={labelClass}>Langue de l’interface</label>
                  <select
                    value={settings.locale.language}
                    onChange={(e) => update('locale', { language: e.target.value as 'fr' | 'ar' })}
                    className={inputClass}
                  >
                    <option value="fr">Français</option>
                    <option value="ar">العربية (à venir)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">La traduction complète de l’interface peut être branchée ensuite.</p>
                </div>
                <div>
                  <label className={labelClass}>Fuseau horaire</label>
                  <select
                    value={settings.locale.timezone}
                    onChange={(e) => update('locale', { timezone: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Africa/Casablanca">Africa/Casablanca (Maroc)</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Premier jour de la semaine</label>
                  <select
                    value={settings.locale.weekStartsOn}
                    onChange={(e) => update('locale', { weekStartsOn: e.target.value as 'monday' | 'sunday' })}
                    className={inputClass}
                  >
                    <option value="monday">Lundi</option>
                    <option value="sunday">Dimanche</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Lecture des paramètres pour d’autres modules (PDF, factures, etc.) */
export function getStoredAppSettings(): DarbisAppSettings {
  return loadSettings();
}
