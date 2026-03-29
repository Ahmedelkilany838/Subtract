# 🚀 تحسينات Subtract - المميزات الجديدة

## ✨ المميزات المضافة

### 1. Export/Import (تم ✅)
- ملف: `src/exportImport.ts`
- Export كـ CSV
- Export كـ JSON  
- Import من CSV

### 2. Toast Notifications
### 3. Search & Filter
### 4. Sort Options
### 5. Notes للاشتراكات
### 6. Better Mobile Responsive

---

## 📝 التعليمات لتطبيق التحسينات

### خطوة 1: استيراد Export/Import في App.tsx

أضف في أعلى الملف (بعد السطر 103):

```typescript
import { exportToCSV, exportToJSON, importFromCSV } from './exportImport';
```

### خطوة 2: إضافة State للتحسينات الجديدة

أضف داخل `AppContent` component (حوالي السطر 230):

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [filterCategory, setFilterCategory] = useState<string>('all');
const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date'>('name');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
```

### خطوة 3: إضافة دوال Export/Import

أضف قبل الـ `return` في `AppContent`:

```typescript
const handleExportCSV = () => {
  exportToCSV(subscriptions);
  setToast({ message: 'تم تصدير الاشتراكات بنجاح!', type: 'success' });
};

const handleExportJSON = () => {
  exportToJSON(subscriptions);
  setToast({ message: 'تم تصدير الاشتراكات بنجاح!', type: 'success' });
};

const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  importFromCSV(
    file,
    async (data) => {
      try {
        for (const sub of data) {
          const service = GLOBAL_SERVICES.find(s => 
            s.name.toLowerCase() === sub.serviceName.toLowerCase()
          ) || {
            id: 'custom',
            name: sub.serviceName,
            slug: sub.serviceName.toLowerCase().replace(/\s+/g, ''),
            domain: 'custom.com',
            category: sub.category
          };
          
          await addDoc(collection(db, 'subscriptions'), {
            serviceId: service.id,
            serviceName: service.name,
            slug: service.slug,
            domain: service.domain,
            planName: sub.planName,
            amount: sub.amount,
            currency: sub.currency,
            billingCycle: sub.billingCycle,
            nextBillingDate: sub.nextBillingDate,
            category: sub.category,
            notes: sub.notes,
            uid: user.uid,
            createdAt: serverTimestamp()
          });
        }
        setToast({ message: `تم استيراد ${data.length} اشتراك بنجاح!`, type: 'success' });
      } catch (error) {
        setToast({ message: 'فشل استيراد الاشتراكات', type: 'error' });
      }
    },
    (error) => {
      setToast({ message: error, type: 'error' });
    }
  );
  
  event.target.value = '';
};
```

### خطوة 4: إضافة دوال Search & Filter & Sort

```typescript
const filteredAndSortedSubscriptions = useMemo(() => {
  let filtered = subscriptions;
  
  // Search
  if (searchQuery) {
    filtered = filtered.filter(sub =>
      sub.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Filter by category
  if (filterCategory !== 'all') {
    filtered = filtered.filter(sub => sub.category === filterCategory);
  }
  
  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.serviceName.localeCompare(b.serviceName);
        break;
      case 'amount':
        const aAmount = convertToDisplay(a.amount, a.currency);
        const bAmount = convertToDisplay(b.amount, b.currency);
        comparison = aAmount - bAmount;
        break;
      case 'date':
        comparison = (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}, [subscriptions, searchQuery, filterCategory, sortBy, sortOrder]);
```

### خطوة 5: إضافة UI للمميزات الجديدة

ابحث عن السطر اللي فيه:
```typescript
{!isAddingInline && (
  <div className="flex items-center gap-2">
```

و استبدله بـ:

```typescript
{!isAddingInline && (
  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
    {/* Search Bar */}
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="ابحث عن اشتراك..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 h-10"
      />
    </div>
    
    {/* Filter */}
    <Select value={filterCategory} onValueChange={setFilterCategory}>
      <SelectTrigger className="w-full md:w-40 h-10">
        <Filter className="w-4 h-4 mr-2" />
        <SelectValue placeholder="الكل" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">كل الفئات</SelectItem>
        <SelectItem value="Entertainment">Entertainment</SelectItem>
        <SelectItem value="Productivity">Productivity</SelectItem>
        <SelectItem value="Cloud Storage">Cloud Storage</SelectItem>
        <SelectItem value="Development">Development</SelectItem>
        <SelectItem value="Design">Design</SelectItem>
        <SelectItem value="Music">Music</SelectItem>
        <SelectItem value="Communication">Communication</SelectItem>
        <SelectItem value="Other">Other</SelectItem>
      </SelectContent>
    </Select>
    
    {/* Sort */}
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto h-10">
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          ترتيب
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">ترتيب حسب:</Label>
          <div className="space-y-1">
            <Button
              variant={sortBy === 'name' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setSortBy('name')}
            >
              الاسم
            </Button>
            <Button
              variant={sortBy === 'amount' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setSortBy('amount')}
            >
              المبلغ
            </Button>
            <Button
              variant={sortBy === 'date' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setSortBy('date')}
            >
              التاريخ
            </Button>
          </div>
          <Separator />
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
            {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    
    {/* Export/Import Menu */}
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto h-10">
          <Download className="w-4 h-4 mr-2" />
          تصدير / استيراد
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            تصدير CSV
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={handleExportJSON}
          >
            <Download className="w-4 h-4 mr-2" />
            تصدير JSON
          </Button>
          <Separator />
          <label htmlFor="import-csv" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm cursor-pointer"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                استيراد CSV
              </span>
            </Button>
            <input
              id="import-csv"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
    
    <Button onClick={() => setIsAddingInline(true)} className="h-10 w-full md:w-auto">
      <Plus className="w-4 h-4 mr-2" />
      إضافة اشتراك
    </Button>
  </div>
)}
```

### خطوة 6: إضافة Toast في الـ JSX

أضف قبل آخر `</div>` في الـ return:

```typescript
{/* Toast Notifications */}
<AnimatePresence>
  {toast && (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={cn(
        "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-md",
        toast.type === 'success' && "bg-emerald-500",
        toast.type === 'error' && "bg-rose-500",
        toast.type === 'info' && "bg-blue-500"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{toast.message}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-white/20"
          onClick={() => setToast(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### خطوة 7: استبدال subscriptions بـ filteredAndSortedSubscriptions

ابحث في الكود عن كل مكان مكتوب فيه:
```typescript
{subscriptions.map(...)}
```

و استبدله بـ:
```typescript
{filteredAndSortedSubscriptions.map(...)}
```

### خطوة 8: إضافة Notes للاشتراك

في الـ Dialog اللي بتضيف/تعدل subscription، أضف قبل الـ Submit button:

```typescript
<div className="space-y-2">
  <Label htmlFor="notes">ملاحظات (اختياري)</Label>
  <Textarea
    id="notes"
    placeholder="أي ملاحظات عن هذا الاشتراك..."
    rows={3}
    {...register('notes')}
    className="resize-none"
  />
</div>
```

---

## 📱 تحسينات Mobile Responsive

### في index.css، أضف:

```css
/* Better mobile touch targets */
@media (max-width: 768px) {
  button, a, input, select {
    min-height: 44px;
  }
  
  .subscription-card {
    padding: 1rem;
  }
  
  .stat-card {
    padding: 1rem !important;
  }
}

/* Better mobile spacing */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .modal-content {
    max-width: calc(100vw - 2rem);
  }
}
```

---

## ✅ Checklist التطبيق

- [ ] إضافة import للـ exportImport.ts
- [ ] إضافة State الجديد
- [ ] إضافة دوال Export/Import
- [ ] إضافة دوال Search/Filter/Sort
- [ ] تحديث UI بالعناصر الجديدة
- [ ] إضافة Toast notifications
- [ ] استبدال subscriptions بـ filteredAndSortedSubscriptions
- [ ] إضافة Notes field
- [ ] إضافة Mobile CSS

---

**بعد التطبيق، test كل الميزات الجديدة!** 🚀
