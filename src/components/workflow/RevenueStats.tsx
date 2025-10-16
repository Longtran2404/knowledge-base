/**
 * Revenue Statistics Component
 * Display revenue, commission, and sales metrics
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface RevenueData {
  totalRevenue: number;
  totalSales: number;
  totalCommission: number;
  averageOrderValue: number;
  monthlyRevenue?: number;
  monthlyGrowth?: number; // percentage
}

interface RevenueStatsProps {
  data: RevenueData;
  isPartner?: boolean;
}

export function RevenueStats({ data, isPartner = false }: RevenueStatsProps) {
  const stats = [
    {
      label: isPartner ? 'Tổng hoa hồng' : 'Tổng doanh thu',
      value: isPartner ? data.totalCommission : data.totalRevenue,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
      suffix: 'đ',
    },
    {
      label: 'Đơn hàng',
      value: data.totalSales,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-500',
      suffix: '',
    },
    {
      label: 'Giá trị TB',
      value: data.averageOrderValue,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      suffix: 'đ',
    },
    ...(data.monthlyRevenue
      ? [
          {
            label: 'Tháng này',
            value: data.monthlyRevenue,
            icon: Percent,
            gradient: 'from-orange-500 to-red-500',
            suffix: 'đ',
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="relative group"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-xl blur-xl group-hover:opacity-20 transition-opacity`} />
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>

            {/* Label */}
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>

            {/* Value */}
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">
                {stat.value.toLocaleString('vi-VN')}
                {stat.suffix && <span className="text-xl text-slate-400">{stat.suffix}</span>}
              </p>
            </div>

            {/* Growth indicator (if monthly data available) */}
            {stat.label === 'Tháng này' && data.monthlyGrowth !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${data.monthlyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.monthlyGrowth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(data.monthlyGrowth).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Commission Breakdown Component
 * Shows detailed commission breakdown for partners
 */
interface CommissionBreakdownProps {
  workflows: Array<{
    name: string;
    sales: number;
    revenue: number;
    commission_percent: number;
    commission_earned: number;
  }>;
}

export function CommissionBreakdown({ workflows }: CommissionBreakdownProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Chi tiết hoa hồng theo Workflow</h3>

      <div className="space-y-3">
        {workflows.map((workflow, idx) => (
          <div
            key={idx}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">{workflow.name}</h4>
              <span className="text-sm text-slate-400">{workflow.sales} đơn</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Doanh thu</p>
                <p className="text-white font-semibold">{workflow.revenue.toLocaleString('vi-VN')}đ</p>
              </div>
              <div>
                <p className="text-slate-400">Tỷ lệ</p>
                <p className="text-purple-400 font-semibold">{workflow.commission_percent}%</p>
              </div>
              <div>
                <p className="text-slate-400">Hoa hồng</p>
                <p className="text-green-400 font-bold">{workflow.commission_earned.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{
                  width: `${(workflow.commission_earned / workflows.reduce((sum, w) => sum + w.commission_earned, 0)) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-white">Tổng hoa hồng:</span>
          <span className="text-2xl font-bold text-green-400">
            {workflows.reduce((sum, w) => sum + w.commission_earned, 0).toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>
    </div>
  );
}
