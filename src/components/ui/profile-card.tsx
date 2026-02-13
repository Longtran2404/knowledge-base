/**
 * ProfileCard Component - Modern profile card with glass morphism effect
 * Perfect for dark theme with animated elements
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Calendar, Award, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FluidGlass } from './fluid-glass';

interface ProfileCardProps {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  location?: string;
  joinDate?: string;
  stats?: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }[];
  badges?: string[];
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onEdit?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  phone,
  avatar,
  role = 'Member',
  location,
  joinDate,
  stats = [],
  badges = [],
  className,
  variant = 'default',
  onEdit,
}) => {
  if (variant === 'compact') {
    return (
      <FluidGlass variant="dark" blur="lg" glow className={cn('p-4', className)}>
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30"
                onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-sm text-gray-400">{role}</p>
          </div>
        </div>
      </FluidGlass>
    );
  }

  return (
    <FluidGlass
      variant="dark"
      blur="xl"
      glow
      glowColor="shadow-blue-500/20"
      className={cn('overflow-hidden', className)}
    >
      {/* Header with gradient */}
      <div className="h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative">
        <div className="absolute inset-0 bg-black/20" />
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 px-3 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Profile content */}
      <div className="p-6 relative">
        {/* Avatar */}
        <div className="absolute -top-16 left-6">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-black/50 shadow-xl"
              onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-black/50 shadow-xl">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-black" />
        </div>

        {/* Name and role */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {name}
            {badges.includes('verified') && (
              <Award className="w-5 h-5 text-blue-400" />
            )}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{role}</p>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2">
          {email && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{phone}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{location}</span>
            </div>
          )}
          {joinDate && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Tham gia từ {joinDate}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                {stat.icon && (
                  <div className="flex justify-center mb-2 text-blue-400">
                    {stat.icon}
                  </div>
                )}
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-300 backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </FluidGlass>
  );
};

export default ProfileCard;
