"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ===== Translation Dictionary =====
const translations = {
  bn: {
    // Sidebar
    "nav.dashboard": "হোম",
    "nav.entry": "উৎপাদন লিখুন",
    "nav.machines": "মেশিন",
    "nav.workers": "কর্মী",
    "nav.reports": "রিপোর্ট",
    "nav.reports.daily": "দৈনিক রিপোর্ট",
    "nav.reports.monthly": "মাসিক রিপোর্ট",
    "nav.reports.yearly": "বার্ষিক রিপোর্ট",
    "nav.reports.payslip": "বেতন স্লিপ",
    "nav.settings": "সেটিংস",
    "nav.settings.wage": "মজুরি হার",
    "nav.settings.users": "ব্যবহারকারী",
    "sidebar.brand": "মিলট্র্যাক",
    "sidebar.subtitle": "উৎপাদন ও মজুরি",
    "sidebar.logout": "লগ আউট",

    // Header
    "header.home": "হোম",
    "header.dashboard": "হোম",
    "header.entry": "উৎপাদন লিখুন",
    "header.machines": "মেশিন ব্যবস্থাপনা",
    "header.workers": "কর্মী ব্যবস্থাপনা",
    "header.reports.daily": "দৈনিক রিপোর্ট",
    "header.reports.monthly": "মাসিক রিপোর্ট",
    "header.reports.yearly": "বার্ষিক রিপোর্ট",
    "header.reports.payslip": "বেতন স্লিপ",
    "header.settings.wage": "মজুরি হার সেটিংস",
    "header.settings.users": "ব্যবহারকারী ব্যবস্থাপনা",

    // Dashboard
    "dash.greeting.morning": "শুভ সকাল",
    "dash.greeting.afternoon": "শুভ অপরাহ্ণ",
    "dash.greeting.evening": "শুভ সন্ধ্যা",
    "dash.subtitle": "আজকের মিলের সারসংক্ষেপ",
    "dash.today_output": "আজকের উৎপাদন",
    "dash.monthly_output": "এই মাসের উৎপাদন",
    "dash.monthly_wage": "মাসিক মজুরি",
    "dash.active_workers": "সক্রিয় কর্মী",
    "dash.enter_production": "উৎপাদন লিখুন",
    "dash.enter_production_desc": "আজকের উৎপাদন তথ্য দিন",
    "dash.daily_report": "দৈনিক রিপোর্ট",
    "dash.daily_report_desc": "আজকের বিস্তারিত দেখুন",
    "dash.monthly_report": "মাসিক রিপোর্ট",
    "dash.monthly_report_desc": "এই মাসের সারসংক্ষেপ",
    "dash.payslip": "বেতন স্লিপ",
    "dash.payslip_desc": "কর্মীর বেতন স্লিপ বানান",
    "dash.yards": "গজ",

    // Production Entry
    "entry.title": "নতুন উৎপাদন এন্ট্রি",
    "entry.date": "তারিখ",
    "entry.machine": "মেশিন",
    "entry.select_machine": "মেশিন নির্বাচন করুন",
    "entry.worker": "কর্মী",
    "entry.select_worker": "কর্মী নির্বাচন করুন",
    "entry.segments": "সেগমেন্ট (সুতা পরিবর্তন)",
    "entry.add_segment": "সেগমেন্ট যোগ করুন",
    "entry.yards": "গজ",
    "entry.total_yards": "মোট গজ",
    "entry.tana": "তানা সংখ্যা",
    "entry.tana_hint": "কতটি তানা শেষ হয়েছে",
    "entry.live_wage": "মজুরি প্রিভিউ",
    "entry.no_rate_warning": "সতর্কতা: কোনো মজুরি হার সেট করা নেই। সেটিংস থেকে যোগ করুন।",
    "entry.rate_applied": "প্রযোজ্য হার",
    "entry.save_next": "সেভ করুন ও পরের কর্মী",
    "entry.save_only": "শুধু সেভ করুন",
    "entry.session_entries": "এই সেশনের এন্ট্রি",
    "entry.no_entries": "এখনো কোনো এন্ট্রি নেই।",
    "entry.fill_form": "ফর্ম পূরণ করে সেভ করুন।",
    "entry.entries": "এন্ট্রি",
    "entry.total": "মোট",
    "entry.existing_entries": "এই তারিখের বিদ্যমান এন্ট্রি",
    "entry.no_existing": "এই তারিখে এখনো কোনো এন্ট্রি নেই।",

    // Machines
    "machines.total": "মোট মেশিন",
    "machines.active": "সক্রিয়",
    "machines.repair": "মেরামতে",
    "machines.search": "নম্বর বা মডেল দিয়ে খুঁজুন...",
    "machines.all": "সব",
    "machines.under_repair": "মেরামতে",
    "machines.add": "নতুন মেশিন যোগ করুন",
    "machines.add_title": "নতুন মেশিন যোগ করুন",
    "machines.number": "মেশিন নম্বর",
    "machines.type": "ধরন / মডেল",
    "machines.added": "যোগ হয়েছে",
    "machines.cancel": "বাতিল",

    // Workers
    "workers.total": "মোট কর্মী",
    "workers.active": "সক্রিয়",
    "workers.inactive": "নিষ্ক্রিয়",
    "workers.search": "নাম বা আইডি দিয়ে খুঁজুন...",
    "workers.all": "সব",
    "workers.add": "নতুন কর্মী যোগ করুন",
    "workers.add_title": "নতুন কর্মী যোগ করুন",
    "workers.name": "পুরো নাম",
    "workers.id": "কর্মী আইডি",
    "workers.joining": "যোগদানের তারিখ",
    "workers.cancel": "বাতিল",
    "workers.status": "অবস্থা",
    "workers.actions": "অ্যাকশন",

    // Daily Report
    "daily.date": "তারিখ",
    "daily.print": "প্রিন্ট করুন",
    "daily.mill_total": "মিল মোট",
    "daily.machines_entries": "মেশিন · এন্ট্রি",
    "daily.breakdown": "মেশিন ভিত্তিক বিবরণ",
    "daily.no_entries": "এই তারিখে কোনো এন্ট্রি পাওয়া যায়নি।",
    "daily.worker": "কর্মী",
    "daily.segments": "সেগমেন্ট",
    "daily.total": "মোট",
    "daily.tana": "তানা",
    "daily.grand_total": "সর্বমোট",
    "daily.workers_count": "জন কর্মী",

    // Monthly Report
    "monthly.month": "মাস",
    "monthly.year": "বছর",
    "monthly.print": "প্রিন্ট করুন",
    "monthly.total_output": "মোট উৎপাদন",
    "monthly.total_wage": "মোট মজুরি",
    "monthly.active_machines": "সক্রিয় মেশিন",
    "monthly.active_workers": "সক্রিয় কর্মী",
    "monthly.daily_trend": "দৈনিক উৎপাদন",
    "monthly.machine_output": "মেশিন ভিত্তিক উৎপাদন",
    "monthly.worker_output": "কর্মী ভিত্তিক উৎপাদন ও মজুরি",
    "monthly.machine": "মেশিন",
    "monthly.model": "মডেল",
    "monthly.total_yards": "মোট গজ",
    "monthly.tana": "তানা",
    "monthly.worker": "কর্মী",
    "monthly.days": "দিন",
    "monthly.yards": "গজ",
    "monthly.wage": "মজুরি",
    "monthly.total": "মোট",

    // Yearly Report
    "yearly.title": "বার্ষিক রিপোর্ট",
    "yearly.year": "বছর",
    "yearly.print": "প্রিন্ট করুন",
    "yearly.total_output": "বার্ষিক উৎপাদন",
    "yearly.total_wage": "বার্ষিক মজুরি",
    "yearly.total_tana": "বার্ষিক তানা",
    "yearly.total_days": "কর্মদিবস",
    "yearly.monthly_breakdown": "মাস ভিত্তিক বিবরণ",
    "yearly.month": "মাস",
    "yearly.yards": "গজ",
    "yearly.wage": "মজুরি",
    "yearly.tana": "তানা",
    "yearly.days": "দিন",
    "yearly.chart_title": "মাসিক উৎপাদন তুলনা",

    // Payslip
    "payslip.worker": "কর্মী",
    "payslip.select_worker": "কর্মী নির্বাচন করুন",
    "payslip.month": "মাস",
    "payslip.year": "বছর",
    "payslip.print": "বেতন স্লিপ প্রিন্ট",
    "payslip.select_prompt": "কর্মী নির্বাচন করুন",
    "payslip.select_desc": "বেতন স্লিপ তৈরি করতে কর্মী ও সময়কাল নির্বাচন করুন।",
    "payslip.title": "বেতন স্লিপ",
    "payslip.company": "মিলট্র্যাক",
    "payslip.company_desc": "কাপড় মিল উৎপাদন ও মজুরি ব্যবস্থাপনা",
    "payslip.wage_slip": "বেতন স্লিপ",
    "payslip.worker_name": "কর্মীর নাম",
    "payslip.worker_id": "কর্মী আইডি",
    "payslip.period": "সময়কাল",
    "payslip.generated": "তৈরির তারিখ",
    "payslip.date": "তারিখ",
    "payslip.machine": "মেশিন",
    "payslip.segments": "সেগমেন্ট",
    "payslip.yards": "গজ",
    "payslip.tana": "তানা",
    "payslip.no_entries": "এই সময়কালে কোনো উৎপাদন এন্ট্রি নেই।",
    "payslip.days_worked": "কর্মদিবস",
    "payslip.total_yards": "মোট গজ",
    "payslip.total_tana": "মোট তানা",
    "payslip.rate": "প্রযোজ্য হার",
    "payslip.total_wage": "মোট মজুরি",
    "payslip.worker_sig": "কর্মীর স্বাক্ষর",
    "payslip.auth_sig": "কর্তৃপক্ষের স্বাক্ষর",

    // Wage Rate
    "wage.current": "বর্তমান প্রতি গজ হার",
    "wage.effective": "কার্যকর তারিখ",
    "wage.warning_title": "গুরুত্বপূর্ণ",
    "wage.warning_text": "হার পরিবর্তন করলে শুধুমাত্র কার্যকর তারিখের পরের এন্ট্রিতে প্রভাব পড়বে। পুরনো রেকর্ড অপরিবর্তিত থাকবে।",
    "wage.update": "মজুরি হার আপডেট করুন",
    "wage.history": "হারের ইতিহাস",
    "wage.effective_from": "কার্যকর তারিখ",
    "wage.rate": "হার (টাকা/গজ)",
    "wage.status": "অবস্থা",
    "wage.current_label": "বর্তমান",
    "wage.archived": "পুরাতন",
    "wage.update_title": "মজুরি হার আপডেট",
    "wage.update_note": "নতুন হার তৈরি হবে। কার্যকর তারিখ থেকে এই হার ব্যবহৃত হবে।",
    "wage.new_rate": "নতুন হার (টাকা প্রতি গজ)",
    "wage.save": "নতুন হার সেভ করুন",
    "wage.cancel": "বাতিল",

    // Users
    "users.title": "ব্যবহারকারী ব্যবস্থাপনা",
    "users.add": "নতুন ব্যবহারকারী",
    "users.name": "নাম",
    "users.username": "ইউজারনেম",
    "users.role": "ভূমিকা",
    "users.created": "তৈরির তারিখ",
    "users.add_title": "নতুন ব্যবহারকারী যোগ করুন",
    "users.full_name": "পুরো নাম",
    "users.password": "পাসওয়ার্ড",
    "users.cancel": "বাতিল",

    // Login
    "login.title": "মিলট্র্যাক",
    "login.subtitle": "কাপড় মিল উৎপাদন ও মজুরি ব্যবস্থাপনা",
    "login.welcome": "লগইন করুন",
    "login.username": "ইউজারনেম",
    "login.password": "পাসওয়ার্ড",
    "login.submit": "লগইন",
    "login.error": "ভুল ইউজারনেম বা পাসওয়ার্ড",

    // Status
    "status.active": "সক্রিয়",
    "status.inactive": "নিষ্ক্রিয়",
    "status.under_repair": "মেরামতে",
    "status.logged": "সম্পন্ন",
    "status.pending": "বাকি",

    // Common
    "common.loading": "লোড হচ্ছে...",
    "common.no_data": "কোনো তথ্য নেই",
    "common.save": "সেভ করুন",
    "common.cancel": "বাতিল",
    "common.total": "মোট",
    "common.yards": "গজ",
    "common.bdt_per_yard": "টাকা/গজ",

    // Months
    "month.1": "জানুয়ারি",
    "month.2": "ফেব্রুয়ারি",
    "month.3": "মার্চ",
    "month.4": "এপ্রিল",
    "month.5": "মে",
    "month.6": "জুন",
    "month.7": "জুলাই",
    "month.8": "আগস্ট",
    "month.9": "সেপ্টেম্বর",
    "month.10": "অক্টোবর",
    "month.11": "নভেম্বর",
    "month.12": "ডিসেম্বর",
  },

  en: {
    // Sidebar
    "nav.dashboard": "Home",
    "nav.entry": "Production Entry",
    "nav.machines": "Machines",
    "nav.workers": "Workers",
    "nav.reports": "Reports",
    "nav.reports.daily": "Daily Report",
    "nav.reports.monthly": "Monthly Report",
    "nav.reports.yearly": "Yearly Report",
    "nav.reports.payslip": "Payslip",
    "nav.settings": "Settings",
    "nav.settings.wage": "Wage Rate",
    "nav.settings.users": "Users",
    "sidebar.brand": "MillTrack",
    "sidebar.subtitle": "Production & Wages",
    "sidebar.logout": "Log Out",

    // Header
    "header.home": "Home",
    "header.dashboard": "Home",
    "header.entry": "Production Entry",
    "header.machines": "Machine Management",
    "header.workers": "Worker Management",
    "header.reports.daily": "Daily Report",
    "header.reports.monthly": "Monthly Report",
    "header.reports.yearly": "Yearly Report",
    "header.reports.payslip": "Wage Slip",
    "header.settings.wage": "Wage Rate Settings",
    "header.settings.users": "User Management",

    // Dashboard
    "dash.greeting.morning": "Good Morning",
    "dash.greeting.afternoon": "Good Afternoon",
    "dash.greeting.evening": "Good Evening",
    "dash.subtitle": "Here's your mill overview for today",
    "dash.today_output": "Today's Output",
    "dash.monthly_output": "Monthly Output",
    "dash.monthly_wage": "Monthly Wage",
    "dash.active_workers": "Active Workers",
    "dash.enter_production": "Enter Production",
    "dash.enter_production_desc": "Log today's production data",
    "dash.daily_report": "Daily Report",
    "dash.daily_report_desc": "View today's detailed report",
    "dash.monthly_report": "Monthly Report",
    "dash.monthly_report_desc": "This month's summary",
    "dash.payslip": "Payslip",
    "dash.payslip_desc": "Generate worker payslip",
    "dash.yards": "yards",

    // Production Entry
    "entry.title": "New Production Entry",
    "entry.date": "Date",
    "entry.machine": "Machine",
    "entry.select_machine": "Select Machine",
    "entry.worker": "Worker",
    "entry.select_worker": "Select Worker",
    "entry.segments": "Segment Yards (thread changes)",
    "entry.add_segment": "Add Segment",
    "entry.yards": "Yards",
    "entry.total_yards": "Total Yards",
    "entry.tana": "Tana Count",
    "entry.tana_hint": "How many tana ended",
    "entry.live_wage": "Wage Preview",
    "entry.no_rate_warning": "Warning: No wage rate set. Please add one in Settings.",
    "entry.rate_applied": "Rate applied",
    "entry.save_next": "Save & Next Worker",
    "entry.save_only": "Save Only",
    "entry.session_entries": "Session Entries",
    "entry.no_entries": "No entries yet.",
    "entry.fill_form": "Fill the form and save to add entries.",
    "entry.entries": "entries",
    "entry.total": "Total",
    "entry.existing_entries": "Existing Entries for this date",
    "entry.no_existing": "No entries recorded for this date yet.",

    // Machines
    "machines.total": "Total Machines",
    "machines.active": "Active",
    "machines.repair": "Under Repair",
    "machines.search": "Search by number or model...",
    "machines.all": "All",
    "machines.under_repair": "Under Repair",
    "machines.add": "Add Machine",
    "machines.add_title": "Add New Machine",
    "machines.number": "Machine Number",
    "machines.type": "Type / Model",
    "machines.added": "Added",
    "machines.cancel": "Cancel",

    // Workers
    "workers.total": "Total Workers",
    "workers.active": "Active",
    "workers.inactive": "Inactive",
    "workers.search": "Search by name or ID...",
    "workers.all": "All",
    "workers.add": "Add Worker",
    "workers.add_title": "Add New Worker",
    "workers.name": "Full Name",
    "workers.id": "Worker ID",
    "workers.joining": "Joining Date",
    "workers.cancel": "Cancel",
    "workers.status": "Status",
    "workers.actions": "Actions",

    // Daily Report
    "daily.date": "Date",
    "daily.print": "Print Report",
    "daily.mill_total": "Mill Total",
    "daily.machines_entries": "machines · entries",
    "daily.breakdown": "Per-Machine Breakdown",
    "daily.no_entries": "No entries found for this date.",
    "daily.worker": "Worker",
    "daily.segments": "Segments",
    "daily.total": "Total",
    "daily.tana": "Tana",
    "daily.grand_total": "Grand Total",
    "daily.workers_count": "workers",

    // Monthly Report
    "monthly.month": "Month",
    "monthly.year": "Year",
    "monthly.print": "Print Report",
    "monthly.total_output": "Total Output",
    "monthly.total_wage": "Total Wage",
    "monthly.active_machines": "Active Machines",
    "monthly.active_workers": "Active Workers",
    "monthly.daily_trend": "Daily Output Trend",
    "monthly.machine_output": "Output per Machine",
    "monthly.worker_output": "Output & Wage per Worker",
    "monthly.machine": "Machine",
    "monthly.model": "Model",
    "monthly.total_yards": "Total Yards",
    "monthly.tana": "Tana",
    "monthly.worker": "Worker",
    "monthly.days": "Days",
    "monthly.yards": "Yards",
    "monthly.wage": "Wage",
    "monthly.total": "Total",

    // Yearly Report
    "yearly.title": "Yearly Report",
    "yearly.year": "Year",
    "yearly.print": "Print Report",
    "yearly.total_output": "Yearly Output",
    "yearly.total_wage": "Yearly Wage",
    "yearly.total_tana": "Yearly Tana",
    "yearly.total_days": "Working Days",
    "yearly.monthly_breakdown": "Month-by-Month Breakdown",
    "yearly.month": "Month",
    "yearly.yards": "Yards",
    "yearly.wage": "Wage",
    "yearly.tana": "Tana",
    "yearly.days": "Days",
    "yearly.chart_title": "Monthly Output Comparison",

    // Payslip
    "payslip.worker": "Worker",
    "payslip.select_worker": "Select Worker",
    "payslip.month": "Month",
    "payslip.year": "Year",
    "payslip.print": "Print Payslip",
    "payslip.select_prompt": "Select a Worker",
    "payslip.select_desc": "Choose a worker and period to generate their wage slip.",
    "payslip.title": "Payslip",
    "payslip.company": "MillTrack",
    "payslip.company_desc": "Clothing Mill Production & Wage Management",
    "payslip.wage_slip": "WAGE SLIP",
    "payslip.worker_name": "Worker Name",
    "payslip.worker_id": "Worker ID",
    "payslip.period": "Period",
    "payslip.generated": "Generated",
    "payslip.date": "Date",
    "payslip.machine": "Machine",
    "payslip.segments": "Segments",
    "payslip.yards": "Yards",
    "payslip.tana": "Tana",
    "payslip.no_entries": "No production entries for this period.",
    "payslip.days_worked": "Days Worked",
    "payslip.total_yards": "Total Yards",
    "payslip.total_tana": "Total Tana",
    "payslip.rate": "Rate Applied",
    "payslip.total_wage": "Total Wage",
    "payslip.worker_sig": "Worker Signature",
    "payslip.auth_sig": "Authorized Signature",

    // Wage Rate
    "wage.current": "Current Rate Per Yard",
    "wage.effective": "Effective from",
    "wage.warning_title": "Important",
    "wage.warning_text": "Changing the rate will only affect entries created after the effective date. Historical records remain accurate.",
    "wage.update": "Update Wage Rate",
    "wage.history": "Rate History",
    "wage.effective_from": "Effective From",
    "wage.rate": "Rate (BDT/yard)",
    "wage.status": "Status",
    "wage.current_label": "Current",
    "wage.archived": "Archived",
    "wage.update_title": "Update Wage Rate",
    "wage.update_note": "This will create a new rate entry. Entries on or after the effective date will use this new rate.",
    "wage.new_rate": "New Rate (BDT per yard)",
    "wage.save": "Save New Rate",
    "wage.cancel": "Cancel",

    // Users
    "users.title": "User Management",
    "users.add": "Add User",
    "users.name": "Name",
    "users.username": "Username",
    "users.role": "Role",
    "users.created": "Created",
    "users.add_title": "Add New User",
    "users.full_name": "Full Name",
    "users.password": "Password",
    "users.cancel": "Cancel",

    // Login
    "login.title": "MillTrack",
    "login.subtitle": "Clothing Mill Production & Wage Management",
    "login.welcome": "Sign In",
    "login.username": "Username",
    "login.password": "Password",
    "login.submit": "Sign In",
    "login.error": "Invalid username or password",

    // Status
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.under_repair": "Under Repair",
    "status.logged": "Logged",
    "status.pending": "Pending",

    // Common
    "common.loading": "Loading...",
    "common.no_data": "No data",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.total": "Total",
    "common.yards": "yards",
    "common.bdt_per_yard": "BDT/yard",

    // Months
    "month.1": "January",
    "month.2": "February",
    "month.3": "March",
    "month.4": "April",
    "month.5": "May",
    "month.6": "June",
    "month.7": "July",
    "month.8": "August",
    "month.9": "September",
    "month.10": "October",
    "month.11": "November",
    "month.12": "December",
  },
} as const;

export type Lang = "bn" | "en";
export type TranslationKey = keyof (typeof translations)["bn"];

// ===== Context =====
interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  monthName: (month: number) => string;
}

const LangContext = createContext<LangContextType | null>(null);

// ===== Provider =====
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("milltrack-lang") as Lang;
    if (saved && (saved === "bn" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("milltrack-lang", newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations["en"][key] || key;
  };

  const monthName = (month: number): string => {
    const key = `month.${month}` as TranslationKey;
    return t(key);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, monthName }}>
      {children}
    </LangContext.Provider>
  );
}

// ===== Hook =====
export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    // Fallback for when used outside provider (e.g., login page)
    return {
      lang: "bn" as Lang,
      setLang: () => {},
      t: (key: TranslationKey) => translations["bn"][key] || key,
      monthName: (month: number) => translations["bn"][`month.${month}` as TranslationKey] || "",
    };
  }
  return context;
}
