'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

export default function TodayDate() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  if (!date) {
    return (
      <span className="flex items-center justify-center gap-2 text-dust-400">
        <Calendar size={14} />
        <span>&nbsp;</span>
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center gap-2 text-dust-400">
      <Calendar size={14} />
      <time dateTime={date.toISOString().split('T')[0]}>
        {format(date, 'EEEE, MMMM do, yyyy')}
      </time>
    </span>
  );
}
