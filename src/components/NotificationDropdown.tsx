import React from 'react';
import { useNotification } from '../context/NotificationContext.tsx';
import { formatShortDate } from '../utils/formatters.ts';
import { Bell, CheckCheck, Package, Tag, Info } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateOrder?: (orderId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" />

      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-gray-900">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                {unreadCount} ta yangi
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Barchasini o‘qish
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 space-y-1">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">Hozircha bildirishnomalar yo‘q</p>
            </div>
          ) : (
            notifications.map(n => {
              let Icon = Info;
              let iconBg = 'bg-blue-50 text-blue-600';
              if (n.type === 'ORDER') {
                Icon = Package;
                iconBg = 'bg-emerald-50 text-emerald-600';
              } else if (n.type === 'PROMO') {
                Icon = Tag;
                iconBg = 'bg-amber-50 text-amber-600';
              }

              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${
                    !n.isRead ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-semibold ${!n.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {formatShortDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
