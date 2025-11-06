'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { currentUser } from '@/lib/utils';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import PaymentModal from '@/components/PaymentModal';

export default function VIPPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [plans, setPlans] = useState<Array<{ id: number; name: string; price: number; durationDays: number; dailyDownloads: number; isPopular: boolean; features: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (planId: number) => {
    setSelectedPlanId(planId);
    setShowPaymentModal(true);
  };

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/plans');
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          toast(json?.message || '会员计划加载失败', 'error');
        } else {
          setPlans(Array.isArray(json.data) ? json.data : []);
        }
      } catch {
        toast('网络错误，请稍后再试', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [toast]);

  const benefits = [
    '无限下载VIP专享资源',
    '每日免费下载次数增加',
    '专属客服支持',
    '优先获取最新资源',
    '无广告浏览体验',
    '专属VIP标识',
    '会员专属折扣',
    '提前访问新功能'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">会员计划</h1>
          <p className="text-muted-foreground mt-3">选择适合你的会员方案，立即享受更多下载权益</p>
          {currentUser?.isVip && (
            <div className="mt-4 inline-flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
              <span className="text-sm font-medium">当前状态：VIP会员</span>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-8">
            {loading ? (
              <div className="text-center text-muted-foreground col-span-3">加载中…</div>
            ) : plans.length === 0 ? (
              <div className="text-center text-muted-foreground col-span-3">暂无会员计划</div>
            ) : plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card rounded-lg border p-8 transition-all duration-300 hover:shadow-lg ${
                  plan.isPopular ? 'border-purple-500 ring-1 ring-purple-300' : 'border-border'
                } w-full sm:w-[360px]`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                      最受欢迎
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-purple-600">¥{Number(plan.price || 0).toFixed(2)}</span>
                    <span className="text-muted-foreground">/{plan.durationDays === 0 ? '永久' : `${plan.durationDays}天`}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    每日下载: {plan.dailyDownloads}次
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {currentUser?.isVip ? '续费会员' : '立即开通'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ removed for简洁页面 */}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedPlanId ? plans.find(p => p.id === selectedPlanId)?.price || 0 : 0}
        description={`${selectedPlanId ? plans.find(p => p.id === selectedPlanId)?.name : ''}会员开通`}
        orderType="member"
        productId={selectedPlanId ?? 0}
        onPaymentSuccess={(transactionId) => {
          toast(`支付成功！交易ID: ${transactionId}`, 'success');
          // Here you would typically update the user status and redirect
        }}
      />
    </div>
  );
}