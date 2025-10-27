'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Award, Calendar, MapPin, Users, X } from 'lucide-react';

interface PedigreeData {
  father: {
    name: string;
    ringNumber: string;
    bloodline: string;
    achievements: string[];
  };
  mother: {
    name: string;
    ringNumber: string;
    bloodline: string;
    achievements: string[];
  };
  grandfather: {
    name: string;
    ringNumber: string;
    bloodline: string;
  };
  grandmother: {
    name: string;
    ringNumber: string;
    bloodline: string;
  };
}

interface Champion {
  id: string;
  name: string;
  ringNumber: string;
  bloodline: string;
  pedigree: PedigreeData;
}

interface PedigreeModalProps {
  champion: Champion;
  isOpen: boolean;
  onClose: () => void;
}

export function PedigreeModal({ champion, isOpen, onClose }: PedigreeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Rodowód - {champion.name}</h2>
                <p className="text-blue-100">
                  {champion.ringNumber} • {champion.bloodline}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Zamknij modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-8">
              {/* Current Champion */}
              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Award className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Champion</h3>
                  </div>
                  <h4 className="text-2xl font-bold">{champion.name}</h4>
                  <p className="text-blue-100">{champion.ringNumber}</p>
                  <p className="text-blue-200 text-sm">{champion.bloodline}</p>
                </div>
              </div>

              {/* Parents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Father */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 border-2 border-slate-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h5 className="text-lg font-bold text-blue-900">Ojciec</h5>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h6 className="font-bold text-lg text-gray-900 mb-2">
                      {champion.pedigree.father.name}
                    </h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{champion.pedigree.father.ringNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{champion.pedigree.father.bloodline}</span>
                      </div>
                    </div>
                    {champion.pedigree.father.achievements.length > 0 && (
                      <div className="mt-3">
                        <h6 className="font-medium text-gray-900 text-sm">Osiągnięcia:</h6>
                        <ul className="mt-1 space-y-1">
                          {champion.pedigree.father.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              <span className="text-xs text-gray-600">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mother */}
                <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl p-6 border-2 border-slate-400">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h5 className="text-lg font-bold text-pink-900">Matka</h5>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h6 className="font-bold text-lg text-gray-900 mb-2">
                      {champion.pedigree.mother.name}
                    </h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{champion.pedigree.mother.ringNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{champion.pedigree.mother.bloodline}</span>
                      </div>
                    </div>
                    {champion.pedigree.mother.achievements.length > 0 && (
                      <div className="mt-3">
                        <h6 className="font-medium text-gray-900 text-sm">Osiągnięcia:</h6>
                        <ul className="mt-1 space-y-1">
                          {champion.pedigree.mother.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              <span className="text-xs text-gray-600">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grandparents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grandfather */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Dziadek (Ojca)</h5>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h6 className="font-bold text-lg text-gray-900 mb-2">
                      {champion.pedigree.grandfather.name}
                    </h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {champion.pedigree.grandfather.ringNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {champion.pedigree.grandfather.bloodline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grandmother */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Babcia (Ojca)</h5>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h6 className="font-bold text-lg text-gray-900 mb-2">
                      {champion.pedigree.grandmother.name}
                    </h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {champion.pedigree.grandmother.ringNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {champion.pedigree.grandmother.bloodline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h6 className="font-bold text-slate-900 mb-3">Legenda</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-slate-700">Ojciec</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-pink-600 rounded"></div>
                    <span className="text-slate-700">Matka</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-slate-700">Dziadkowie</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
