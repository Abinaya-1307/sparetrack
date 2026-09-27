import { useMemo, useState } from 'react';
import { Platform, Pressable, TextInput } from 'react-native';
import { ArrowRight, Bell, Camera, Check, ChevronRight, CircleHelp, FileText, Home as HomeIcon, Package, Plus, Search, Settings, ShieldCheck, Store, Upload, X } from '@blinkdotnew/mobile-ui';
import { Button, ScrollView, SizableText, XStack, YStack } from '@blinkdotnew/mobile-ui';
import { allParts, billTotal, formatDate, money, useSpareTrackStore, type Bill, type BillItem } from '@/lib/sparetrack';

const C = { blue: '#2563EB', blueDark: '#1D4ED8', bg: '#F8FAFC', white: '#FFFFFF', ink: '#0F172A', muted: '#64748B', border: '#E2E8F0', green: '#16A34A', softBlue: '#EFF6FF', pale: '#F1F5F9' };
const glyph = (Icon: any, size = 18, color = C.muted) => <Icon size={size} color={color} strokeWidth={1.8} />;

function ActionButton({ label, icon, onPress, secondary = false }: { label: string; icon: any; onPress: () => void; secondary?: boolean }) {
  return <Button onPress={onPress} backgroundColor={secondary ? C.white : C.blue} borderColor={secondary ? C.border : C.blue} borderWidth={1} borderRadius={14} height={50} pressStyle={{ opacity: 0.86, scale: 0.98 }} icon={glyph(icon, 18, secondary ? C.ink : C.white)}><SizableText color={secondary ? C.ink : C.white} fontWeight="700" size={15}>{label}</SizableText></Button>;
}

function AppMark() {
  return <YStack width={38} height={38} borderRadius={12} backgroundColor={C.blue} alignItems="center" justifyContent="center"><SizableText color={C.white} size={17} fontWeight="800">S</SizableText></YStack>;
}

function BillRow({ bill, onPress }: { bill: Bill; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
    <XStack paddingVertical={15} alignItems="center" gap={13} borderBottomWidth={1} borderColor={C.border}>
      <YStack width={42} height={42} borderRadius={12} backgroundColor={C.pale} alignItems="center" justifyContent="center">{glyph(FileText, 18, C.muted)}</YStack>
      <YStack flex={1} gap={4}><SizableText color={C.ink} fontSize={14} fontWeight="700">{bill.invoiceNumber}</SizableText><SizableText color={C.muted} fontSize={12}>{bill.supplier} · {formatDate(bill.invoiceDate)}</SizableText></YStack>
      <YStack alignItems="flex-end" gap={5}><SizableText color={C.ink} fontSize={15} fontWeight="700">{money(billTotal(bill))}</SizableText>{glyph(ChevronRight, 16, '#94A3B8')}</YStack>
    </XStack>
  </Pressable>;
}

function PartResult({ part, onPress }: { part: ReturnType<typeof allParts>[number]; onPress: () => void }) {
  const latest = part.history[0];
  return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
    <YStack padding={16} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={16} marginBottom={10} gap={10}>
      <XStack justifyContent="space-between" alignItems="flex-start" gap={10}><YStack flex={1} gap={4}><SizableText color={C.ink} fontSize={15} fontWeight="700">{part.name}</SizableText><SizableText color={C.muted} fontSize={12}>{part.partNumber} · HSN {part.hsn}</SizableText></YStack>{glyph(ChevronRight, 17)}</XStack>
      <XStack justifyContent="space-between" alignItems="flex-end"><YStack gap={4}><SizableText color={C.blue} fontSize={21} fontWeight="800">{money(latest.item.rate)}</SizableText><SizableText color={C.muted} fontSize={12}>Latest purchase rate</SizableText></YStack><YStack alignItems="flex-end" gap={4}><SizableText color={C.ink} fontSize={12} fontWeight="600">{latest.bill.supplier}</SizableText><SizableText color={C.muted} fontSize={12}>{formatDate(latest.bill.invoiceDate)}</SizableText></YStack></XStack>
    </YStack>
  </Pressable>;
}

function BottomNav({ active, onSelect }: { active: string; onSelect: (key: string) => void }) {
  const items = [{ key: 'home', label: 'Home', icon: HomeIcon }, { key: 'bills', label: 'Bills', icon: FileText }, { key: 'search', label: 'Search', icon: Search }, { key: 'more', label: 'More', icon: Settings }];
  return <XStack backgroundColor={C.white} borderTopWidth={1} borderColor={C.border} paddingHorizontal={12} paddingTop={9} paddingBottom={Platform.OS === 'web' ? 10 : 23} justifyContent="space-around">
    {items.map((item) => <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => onSelect(item.key)} style={{ minWidth: 62, alignItems: 'center', paddingVertical: 3 }}><YStack alignItems="center" gap={4}>{glyph(item.icon, 19, active === item.key ? C.blue : '#94A3B8')}<SizableText color={active === item.key ? C.blue : C.muted} fontSize={11} fontWeight={active === item.key ? '700' : '500'}>{item.label}</SizableText></YStack></Pressable>)}
  </XStack>;
}

function Field({ label, value, onChangeText, placeholder, keyboardType, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: any; multiline?: boolean }) {
  return <YStack gap={7}><SizableText color={C.ink} fontSize={13} fontWeight="600">{label}</SizableText><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#94A3B8" keyboardType={keyboardType} multiline={multiline} style={{ borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: C.ink, fontSize: 15, minHeight: multiline ? 74 : 48, outlineStyle: 'none' as any, textAlignVertical: multiline ? 'top' : 'center' }} /></YStack>;
}

export default function Home() {
  const bills = useSpareTrackStore((s) => s.bills);
  const addBill = useSpareTrackStore((s) => s.addBill);
  const [tab, setTab] = useState('home');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<{ type: 'part'; key: string } | { type: 'bill'; id: string } | null>(null);
  const [flow, setFlow] = useState<'add' | 'manual' | null>(null);
  const [supplier, setSupplier] = useState('');
  const [invoice, setInvoice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [hsn, setHsn] = useState('');
  const [qty, setQty] = useState('1');
  const [rate, setRate] = useState('');
  const [discount, setDiscount] = useState('0');
  const [gst, setGst] = useState('18');
  const [place, setPlace] = useState('Tamil Nadu');
  const [paymentTerms, setPaymentTerms] = useState('Credit');
  const [notice, setNotice] = useState('');

  const parts = useMemo(() => allParts(bills), [bills]);
  const normalized = query.trim().toLowerCase();
  const matchingParts = parts.filter((part) => `${part.name} ${part.partNumber} ${part.hsn} ${part.history.map((x) => x.bill.supplier).join(' ')}`.toLowerCase().includes(normalized));
  const matchingBills = bills.filter((bill) => `${bill.invoiceNumber} ${bill.supplier} ${bill.items.map((i) => `${i.name} ${i.partNumber} ${i.hsn}`).join(' ')}`.toLowerCase().includes(normalized));
  const selectedPart = detail?.type === 'part' ? parts.find((p) => p.key === detail.key) : undefined;
  const selectedBill = detail?.type === 'bill' ? bills.find((b) => b.id === detail.id) : undefined;

  const resetManual = () => { setSupplier(''); setInvoice(''); setName(''); setPartNumber(''); setHsn(''); setQty('1'); setRate(''); setDiscount('0'); setGst('18'); setFlow(null); };
  const saveBill = () => {
    if (!supplier.trim() || !invoice.trim() || !name.trim() || Number(rate) <= 0) { setNotice('Add a supplier, invoice number, part name and rate to save this bill.'); return; }
    const item: BillItem = { id: `item-${Date.now()}`, name: name.trim().toUpperCase(), partNumber: partNumber.trim(), hsn: hsn.trim(), quantity: Number(qty) || 1, unit: 'Set', rate: Number(rate), discount: Number(discount) || 0, gst: Number(gst) || 0 };
    const bill: Bill = { id: `bill-${Date.now()}`, invoiceNumber: invoice.trim(), invoiceDate: date, supplier: supplier.trim(), supplierGstin: '', address: '', placeOfSupply: place, paymentTerms, items: [item] };
    addBill(bill); setNotice('Bill saved successfully. Your part rates are up to date.'); resetManual(); setTab('bills');
  };
  const openTab = (key: string) => { setDetail(null); setFlow(null); setTab(key); if (key !== 'search') setQuery(''); };

  const heading = detail ? detail.type === 'part' ? 'Part details' : 'Bill details' : flow === 'manual' ? 'Enter bill details' : flow === 'add' ? 'Add bill' : ({ home: 'Good morning', bills: 'Bills', search: 'Search anything', more: 'More' } as Record<string, string>)[tab];
  const subheading = detail?.type === 'part' ? '' : detail?.type === 'bill' ? '' : flow === 'manual' ? 'Add the invoice and item details below.' : flow === 'add' ? 'How would you like to add the bill?' : tab === 'home' ? 'Your bills and part rates, all in one place.' : tab === 'search' ? 'Parts, HSN, suppliers and invoice numbers.' : tab === 'bills' ? 'Your supplier purchase history.' : 'Keep your records organized.';

  return <YStack flex={1} backgroundColor={C.bg}>
    <XStack flex={1} width="100%" maxWidth={1160} alignSelf="center">
      {Platform.OS === 'web' && <YStack width={232} backgroundColor={C.white} borderRightWidth={1} borderColor={C.border} padding={20} gap={26}>
        <XStack alignItems="center" gap={11}><AppMark /><YStack><SizableText color={C.ink} size={17} fontWeight="800">SpareTrack</SizableText><SizableText color={C.muted} size={11}>AUTO PARTS MANAGER</SizableText></YStack></XStack>
        <YStack gap={5}>{[{ key: 'home', label: 'Home', icon: HomeIcon }, { key: 'bills', label: 'Bills', icon: FileText }, { key: 'search', label: 'Search', icon: Search }, { key: 'more', label: 'More', icon: Settings }].map((item) => <Pressable key={item.key} onPress={() => openTab(item.key)} style={{ borderRadius: 11, backgroundColor: tab === item.key ? C.softBlue : 'transparent', paddingHorizontal: 12, paddingVertical: 12 }}><XStack gap={11} alignItems="center">{glyph(item.icon, 18, tab === item.key ? C.blue : C.muted)}<SizableText color={tab === item.key ? C.blue : C.muted} fontSize={14} fontWeight={tab === item.key ? '700' : '500'}>{item.label}</SizableText></XStack></Pressable>)}</YStack>
        <YStack flex={1} justifyContent="flex-end"><XStack gap={8} alignItems="center" padding={12} backgroundColor={C.bg} borderRadius={12}>{glyph(ShieldCheck, 17, C.green)}<SizableText color={C.muted} fontSize={12}>Your records stay on this device</SizableText></XStack></YStack>
      </YStack>}
      <YStack flex={1} minWidth={0}>
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal={Platform.OS === 'web' ? 34 : 20} paddingTop={Platform.OS === 'web' ? 22 : 18} paddingBottom={15} backgroundColor={C.bg}>
          <XStack alignItems="center" gap={10}>{Platform.OS !== 'web' && <AppMark />}<YStack><SizableText color={C.ink} fontSize={20} fontWeight="800">{detail || flow ? heading : tab === 'home' ? 'SpareTrack' : heading}</SizableText>{!detail && !flow && <SizableText color={C.muted} fontSize={12}>{tab === 'home' ? 'Auto Parts Bill Manager' : subheading}</SizableText>}</YStack></XStack>
          <Pressable accessibilityLabel="Settings" onPress={() => openTab('more')} style={{ height: 42, width: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.white }}>{glyph(Bell, 18, C.ink)}</Pressable>
        </XStack>
        <ScrollView flex={1} contentContainerStyle={{ paddingHorizontal: Platform.OS === 'web' ? 34 : 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {detail && <XStack marginTop={5} marginBottom={14}><Pressable onPress={() => setDetail(null)} style={{ minHeight: 42, justifyContent: 'center' }}><XStack gap={7} alignItems="center">{glyph(ArrowRight, 16, C.blue)}<SizableText color={C.blue} fontSize={13} fontWeight="600">Back</SizableText></XStack></Pressable></XStack>}
          {notice ? <XStack marginBottom={14} padding={13} backgroundColor="#F0FDF4" borderColor="#BBF7D0" borderWidth={1} borderRadius={12} justifyContent="space-between" alignItems="center" gap={8}><XStack flex={1} gap={8} alignItems="center">{glyph(Check, 17, C.green)}<SizableText color="#166534" fontSize={13}>{notice}</SizableText></XStack><Pressable onPress={() => setNotice('')}>{glyph(X, 16, C.muted)}</Pressable></XStack> : null}

          {detail?.type === 'part' && selectedPart && <YStack gap={18}>
            <YStack padding={22} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={18} gap={13}><XStack alignItems="center" gap={13}><YStack width={48} height={48} borderRadius={14} backgroundColor={C.softBlue} alignItems="center" justifyContent="center">{glyph(Package, 22, C.blue)}</YStack><YStack flex={1}><SizableText color={C.ink} fontSize={19} fontWeight="800">{selectedPart.name}</SizableText><SizableText color={C.muted} fontSize={13}>{selectedPart.partNumber || 'Part number not added'}</SizableText></YStack></XStack><SizableText color={C.muted} fontSize={12}>HSN {selectedPart.hsn || '—'}</SizableText></YStack>
            <YStack padding={22} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={18} gap={6}><SizableText color={C.muted} fontSize={12} fontWeight="600">LATEST PURCHASE</SizableText><SizableText color={C.blue} fontSize={34} fontWeight="800">{money(selectedPart.history[0].item.rate)}</SizableText><SizableText color={C.ink} fontSize={14} fontWeight="600">{formatDate(selectedPart.history[0].bill.invoiceDate)} · {selectedPart.history[0].bill.supplier}</SizableText><SizableText color={C.muted} fontSize={12}>Purchase rate, before discount and GST</SizableText></YStack>
            {selectedPart.history.length > 1 && <YStack padding={20} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={18} gap={14}><XStack justifyContent="space-between" alignItems="center"><SizableText color={C.ink} fontSize={16} fontWeight="700">Previous purchases</SizableText><SizableText color={C.muted} fontSize={12}>{selectedPart.history.length} records</SizableText></XStack>{selectedPart.history.slice(1).map(({ bill, item }) => <XStack key={bill.id} justifyContent="space-between" alignItems="center" paddingVertical={10} borderTopWidth={1} borderColor={C.border}><YStack gap={5}><SizableText color={C.ink} fontSize={14} fontWeight="600">{money(item.rate)}</SizableText><SizableText color={C.muted} fontSize={12}>{bill.supplier}</SizableText></YStack><YStack alignItems="flex-end" gap={5}><SizableText color={C.muted} fontSize={12}>{formatDate(bill.invoiceDate)}</SizableText><Pressable onPress={() => setDetail({ type: 'bill', id: bill.id })}><SizableText color={C.blue} fontSize={12} fontWeight="600">View bill</SizableText></Pressable></YStack></XStack>)}</YStack>}
            <SizableText color={C.muted} fontSize={12}>Rates are grouped by part number to keep purchase history together.</SizableText>
          </YStack>}

          {detail?.type === 'bill' && selectedBill && <YStack gap={14}>
            <YStack padding={20} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={17} gap={11}><SizableText color={C.ink} fontSize={18} fontWeight="800">{selectedBill.supplier}</SizableText>{selectedBill.address ? <SizableText color={C.muted} fontSize={13}>{selectedBill.address}</SizableText> : null}<XStack gap={24} marginTop={4}><YStack gap={4}><SizableText color={C.muted} fontSize={11}>INVOICE</SizableText><SizableText color={C.ink} fontSize={13} fontWeight="600">{selectedBill.invoiceNumber}</SizableText></YStack><YStack gap={4}><SizableText color={C.muted} fontSize={11}>DATE</SizableText><SizableText color={C.ink} fontSize={13} fontWeight="600">{formatDate(selectedBill.invoiceDate)}</SizableText></YStack></XStack>{selectedBill.supplierGstin ? <SizableText color={C.muted} fontSize={12}>GSTIN · {selectedBill.supplierGstin}</SizableText> : null}</YStack>
            <YStack padding={20} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={17} gap={8}><SizableText color={C.ink} fontSize={16} fontWeight="700">Items ({selectedBill.items.length})</SizableText>{selectedBill.items.map((item) => { const taxable = item.quantity * item.rate * (1 - item.discount / 100); return <YStack key={item.id} paddingVertical={12} borderTopWidth={1} borderColor={C.border} gap={7}><XStack justifyContent="space-between" gap={8}><YStack flex={1}><SizableText color={C.ink} fontSize={14} fontWeight="600">{item.name}</SizableText><SizableText color={C.muted} fontSize={12}>{item.partNumber} · HSN {item.hsn}</SizableText></YStack><SizableText color={C.ink} fontSize={14} fontWeight="700">{money(taxable * (1 + item.gst / 100))}</SizableText></XStack><SizableText color={C.muted} fontSize={12}>{item.quantity} {item.unit} · Rate {money(item.rate)} · Discount {item.discount}% · GST {item.gst}%</SizableText></YStack>; })}<XStack justifyContent="space-between" paddingTop={12} borderTopWidth={1} borderColor={C.border}><SizableText color={C.ink} fontSize={15} fontWeight="700">Total</SizableText><SizableText color={C.ink} fontSize={18} fontWeight="800">{money(billTotal(selectedBill))}</SizableText></XStack><SizableText color={C.muted} fontSize={12}>{selectedBill.placeOfSupply} · {selectedBill.paymentTerms}</SizableText></YStack>
            <YStack padding={15} backgroundColor={C.softBlue} borderRadius={14} gap={5}><SizableText color={C.blue} fontSize={14} fontWeight="700">Original bill</SizableText><SizableText color={C.muted} fontSize={12}>A scan can be attached when this bill is entered from a photo.</SizableText></YStack>
          </YStack>}

          {flow === 'add' && <YStack gap={12} marginTop={4}><SizableText color={C.muted} fontSize={14} marginBottom={6}>{subheading}</SizableText><Pressable onPress={() => { setNotice('Camera bill scanning is not available in this first version. You can enter the bill manually.'); setFlow('manual'); }}><XStack padding={18} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={16} alignItems="center" gap={14}><YStack width={44} height={44} borderRadius={13} backgroundColor={C.softBlue} alignItems="center" justifyContent="center">{glyph(Camera, 20, C.blue)}</YStack><YStack flex={1} gap={4}><SizableText color={C.ink} fontSize={15} fontWeight="700">Scan Bill</SizableText><SizableText color={C.muted} fontSize={12}>Take a photo of the invoice</SizableText></YStack>{glyph(ChevronRight, 18)}</XStack></Pressable><Pressable onPress={() => setFlow('manual')}><XStack padding={18} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={16} alignItems="center" gap={14}><YStack width={44} height={44} borderRadius={13} backgroundColor={C.pale} alignItems="center" justifyContent="center">{glyph(Plus, 20, C.ink)}</YStack><YStack flex={1} gap={4}><SizableText color={C.ink} fontSize={15} fontWeight="700">Enter manually</SizableText><SizableText color={C.muted} fontSize={12}>Add the bill details yourself</SizableText></YStack>{glyph(ChevronRight, 18)}</XStack></Pressable></YStack>}

          {flow === 'manual' && <YStack gap={15} marginTop={3}><Field label="Supplier" value={supplier} onChangeText={setSupplier} placeholder="Supplier name" /><Field label="Invoice number" value={invoice} onChangeText={setInvoice} placeholder="e.g. CHE/25-2773989" /><Field label="Invoice date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /><Field label="Place of supply" value={place} onChangeText={setPlace} placeholder="Tamil Nadu" /><Field label="Payment terms" value={paymentTerms} onChangeText={setPaymentTerms} placeholder="Credit" /><YStack marginTop={5} paddingTop={18} borderTopWidth={1} borderColor={C.border} gap={15}><XStack justifyContent="space-between" alignItems="center"><SizableText color={C.ink} fontSize={16} fontWeight="700">Bill item</SizableText><SizableText color={C.muted} fontSize={12}>GST calculates automatically</SizableText></XStack><Field label="Part name" value={name} onChangeText={setName} placeholder="Search or enter part" /><XStack gap={10}><YStack flex={1}><Field label="Part number" value={partNumber} onChangeText={setPartNumber} placeholder="Optional" /></YStack><YStack flex={1}><Field label="HSN" value={hsn} onChangeText={setHsn} placeholder="Optional" /></YStack></XStack><XStack gap={10}><YStack flex={1}><Field label="Quantity" value={qty} onChangeText={setQty} keyboardType="decimal-pad" /></YStack><YStack flex={1}><Field label="Rate (₹)" value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="0" /></YStack></XStack><XStack gap={10}><YStack flex={1}><Field label="Discount (%)" value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" /></YStack><YStack flex={1}><Field label="GST (%)" value={gst} onChangeText={setGst} keyboardType="decimal-pad" placeholder="0, 5, 12, 18, 28" /></YStack></XStack><XStack padding={15} backgroundColor={C.white} borderWidth={1} borderColor={C.border} borderRadius={13} justifyContent="space-between" alignItems="center"><YStack gap={4}><SizableText color={C.muted} fontSize={12}>Calculated total</SizableText><SizableText color={C.muted} fontSize={11}>Rate − discount + GST</SizableText></YStack><SizableText color={C.ink} fontSize={20} fontWeight="800">{money((Number(qty) || 0) * (Number(rate) || 0) * (1 - (Number(discount) || 0) / 100) * (1 + (Number(gst) || 0) / 100))}</SizableText></XStack><ActionButton label="Save bill" icon={Check} onPress={saveBill} /></YStack></YStack>}

          {!detail && !flow && tab === 'home' && <YStack gap={22}>
            <YStack gap={13} marginTop={6}><Pressable onPress={() => { setTab('search'); setQuery(''); }}><XStack height={50} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={14} alignItems="center" paddingHorizontal={14} gap={10}>{glyph(Search, 18)}<SizableText color="#94A3B8" fontSize={14}>Search part, HSN, bill number...</SizableText></XStack></Pressable><XStack gap={10}><YStack flex={1}><ActionButton label="Add Bill" icon={Plus} onPress={() => setFlow('add')} /></YStack><YStack flex={1}><ActionButton label="Scan Bill" icon={Camera} secondary onPress={() => { setFlow('add'); }} /></YStack></XStack></YStack>
            <YStack gap={8}><XStack justifyContent="space-between" alignItems="center"><SizableText color={C.ink} fontSize={17} fontWeight="700">Recent bills</SizableText><Pressable onPress={() => setTab('bills')}><SizableText color={C.blue} fontSize={13} fontWeight="600">See all</SizableText></Pressable></XStack><YStack paddingHorizontal={15} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={16}>{bills.slice(0, 4).map((bill) => <BillRow key={bill.id} bill={bill} onPress={() => setDetail({ type: 'bill', id: bill.id })} />)}</YStack></YStack>
            <YStack padding={17} backgroundColor={C.softBlue} borderRadius={15} gap={6}><SizableText color={C.blue} fontSize={14} fontWeight="700">Find a part rate fast</SizableText><SizableText color={C.muted} fontSize={12}>Search a part name or number to see your latest purchase and previous suppliers.</SizableText><Pressable onPress={() => setTab('search')}><SizableText color={C.blue} fontSize={13} fontWeight="700" marginTop={3}>Search parts →</SizableText></Pressable></YStack>
          </YStack>}

          {!detail && !flow && tab === 'bills' && <YStack gap={14}>
            <XStack height={48} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={13} alignItems="center" paddingHorizontal={13} gap={9}>{glyph(Search, 17)}<TextInput value={query} onChangeText={setQuery} placeholder="Search bills..." placeholderTextColor="#94A3B8" style={{ flex: 1, color: C.ink, fontSize: 14, outlineStyle: 'none' as any }} />{query ? <Pressable onPress={() => setQuery('')}>{glyph(X, 16)}</Pressable> : null}</XStack>
            <SizableText color={C.muted} fontSize={13}>{matchingBills.length} bills</SizableText>{matchingBills.length ? <YStack paddingHorizontal={15} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={16}>{matchingBills.map((bill) => <BillRow key={bill.id} bill={bill} onPress={() => setDetail({ type: 'bill', id: bill.id })} />)}</YStack> : <YStack padding={26} alignItems="center" backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={16} gap={8}><SizableText color={C.ink} fontWeight="700">No matching bills</SizableText><SizableText color={C.muted} fontSize={13}>Try a supplier or invoice number.</SizableText></YStack>}
          </YStack>}

          {!detail && !flow && tab === 'search' && <YStack gap={14}>
            <XStack height={50} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={14} alignItems="center" paddingHorizontal={14} gap={10}>{glyph(Search, 18)}<TextInput autoFocus={Platform.OS === 'web'} value={query} onChangeText={setQuery} placeholder="Part, HSN, supplier or invoice..." placeholderTextColor="#94A3B8" style={{ flex: 1, color: C.ink, fontSize: 14, outlineStyle: 'none' as any }} />{query ? <Pressable onPress={() => setQuery('')}>{glyph(X, 17)}</Pressable> : null}</XStack>
            {!normalized ? <YStack gap={13} marginTop={8}><SizableText color={C.ink} fontSize={15} fontWeight="700">Popular parts</SizableText>{parts.slice(0, 4).map((part) => <PartResult key={part.key} part={part} onPress={() => setDetail({ type: 'part', key: part.key })} />)}<SizableText color={C.muted} fontSize={12}>Try “TATA ACE KIT”, “84099191” or a supplier name.</SizableText></YStack> : <YStack gap={15}><SizableText color={C.muted} fontSize={13}>{matchingParts.length} parts · {matchingBills.length} bills</SizableText>{matchingParts.length > 0 && <YStack gap={2}><SizableText color={C.ink} fontSize={14} fontWeight="700" marginBottom={6}>Parts</SizableText>{matchingParts.map((part) => <PartResult key={part.key} part={part} onPress={() => setDetail({ type: 'part', key: part.key })} />)}</YStack>}{matchingBills.length > 0 && <YStack><SizableText color={C.ink} fontSize={14} fontWeight="700" marginBottom={6}>Bills</SizableText><YStack paddingHorizontal={15} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={16}>{matchingBills.slice(0, 5).map((bill) => <BillRow key={bill.id} bill={bill} onPress={() => setDetail({ type: 'bill', id: bill.id })} />)}</YStack></YStack>}{!matchingParts.length && !matchingBills.length && <YStack padding={26} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={16} alignItems="center" gap={7}><SizableText color={C.ink} fontSize={15} fontWeight="700">No matching records found</SizableText><SizableText color={C.muted} fontSize={13} textAlign="center">Try a part name, HSN, supplier or invoice number.</SizableText></YStack>}</YStack>}
          </YStack>}

          {!detail && !flow && tab === 'more' && <YStack gap={12}>
            {[{ label: 'Suppliers', icon: Store, desc: `${new Set(bills.map((b) => b.supplier)).size} suppliers`, action: () => setNotice('Your suppliers are listed with their bills in the Bills section.') }, { label: 'Parts', icon: Package, desc: `${parts.length} tracked parts`, action: () => { setTab('search'); setQuery(''); } }, { label: 'Backup & Restore', icon: Upload, desc: 'Export a local data backup', action: () => setNotice('Backup export is not available yet. Your bills are stored on this device.') }, { label: 'Settings', icon: Settings, desc: 'App preferences', action: () => setNotice('Settings are coming soon.') }, { label: 'Help', icon: CircleHelp, desc: 'Get help with SpareTrack', action: () => setNotice('Help: add a bill, then search a part to find its purchase rate.') }].map((item) => <Pressable key={item.label} onPress={item.action}><XStack padding={16} backgroundColor={C.white} borderColor={C.border} borderWidth={1} borderRadius={15} alignItems="center" gap={13}><YStack width={40} height={40} backgroundColor={C.pale} borderRadius={12} alignItems="center" justifyContent="center">{glyph(item.icon, 18, C.ink)}</YStack><YStack flex={1} gap={4}><SizableText color={C.ink} fontSize={14} fontWeight="700">{item.label}</SizableText><SizableText color={C.muted} fontSize={12}>{item.desc}</SizableText></YStack>{glyph(ChevronRight, 17)}</XStack></Pressable>)}
            <XStack padding={14} gap={9} alignItems="center" backgroundColor={C.white} borderRadius={13} borderWidth={1} borderColor={C.border}>{glyph(ShieldCheck, 17, C.green)}<SizableText color={C.muted} fontSize={12}>Bills are saved locally on this device.</SizableText></XStack>
          </YStack>}
        </ScrollView>
        {Platform.OS !== 'web' && <BottomNav active={detail || flow ? '' : tab} onSelect={openTab} />}
        {Platform.OS === 'web' && <XStack height={1} backgroundColor={C.border} />}
        {Platform.OS === 'web' && <XStack backgroundColor={C.white} paddingHorizontal={24} paddingVertical={10} borderTopWidth={1} borderColor={C.border} justifyContent="space-between" alignItems="center"><SizableText color={C.muted} fontSize={11}>Your Bills. Your Rates. One Place.</SizableText><XStack gap={6} alignItems="center">{glyph(ShieldCheck, 14, C.green)}<SizableText color={C.muted} fontSize={11}>Stored on this device</SizableText></XStack></XStack>}
      </YStack>
    </XStack>
  </YStack>;
}
