// Export/Import utilities for subscriptions

export interface ExportSubscription {
  serviceName: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate?: string;
  category: string;
  notes?: string;
}

export const exportToCSV = (subscriptions: any[]) => {
  const headers = ['Service', 'Plan', 'Amount', 'Currency', 'Billing Cycle', 'Next Billing', 'Category', 'Notes'];
  const rows = subscriptions.map(sub => [
    sub.serviceName,
    sub.planName || '',
    sub.amount.toString(),
    sub.currency,
    sub.billingCycle,
    sub.nextBillingDate || '',
    sub.category,
    sub.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subtract-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromCSV = (
  file: File,
  onSuccess: (data: ExportSubscription[]) => void,
  onError: (error: string) => void
) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        onError('CSV file is empty or invalid');
        return;
      }
      
      const data: ExportSubscription[] = lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
        
        return {
          serviceName: values[0] || 'Unknown Service',
          planName: values[1] || '',
          amount: parseFloat(values[2]) || 0,
          currency: values[3] || 'USD',
          billingCycle: values[4] === 'yearly' ? 'yearly' : 'monthly',
          nextBillingDate: values[5] || undefined,
          category: values[6] || 'Other',
          notes: values[7] || ''
        };
      }).filter(sub => sub.amount > 0);
      
      if (data.length === 0) {
        onError('No valid subscriptions found in CSV');
        return;
      }
      
      onSuccess(data);
    } catch (error) {
      console.error('CSV import error:', error);
      onError('Failed to parse CSV file. Please check the format.');
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read file');
  };
  
  reader.readAsText(file);
};

export const exportToJSON = (subscriptions: any[]) => {
  const data = subscriptions.map(sub => ({
    serviceName: sub.serviceName,
    planName: sub.planName,
    amount: sub.amount,
    currency: sub.currency,
    billingCycle: sub.billingCycle,
    nextBillingDate: sub.nextBillingDate,
    category: sub.category,
    notes: sub.notes,
    domain: sub.domain,
    slug: sub.slug
  }));

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subtract-subscriptions-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
