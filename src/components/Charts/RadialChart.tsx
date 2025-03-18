// components/Charts/RadialChart.tsx
"use client";

import { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { API_BASE } from '@/lib/contsants';
import { useToast } from '@/hooks/use-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GenderStats {
    male: number;
    female: number;
}

interface User {
    gender: string;
}

interface UserResponse {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
}

export function RadialChart() {
    const [genderStats, setGenderStats] = useState<GenderStats>({ male: 0, female: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchGenderDistribution = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const response = await fetch(`${API_BASE}/users`, { headers });
                const userData = await response.json() as UserResponse;

                const users = userData?.users || [];

                const stats = users.reduce((acc, user) => {
                    const gender = user.gender?.toLowerCase();
                    if (gender === 'male') acc.male += 1;
                    if (gender === 'female') acc.female += 1;
                    return acc;
                }, { male: 0, female: 0 });

                console.log('Gender Distribution:', stats);
                setGenderStats(stats);

            } catch (error) {
                console.error('Error fetching gender distribution:', error);
                toast({
                    title: "Error",
                    description: "Failed to load gender distribution data",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchGenderDistribution();
    }, [toast]);

    const data = {
        labels: ['Male', 'Female'],
        datasets: [
            {
                data: [genderStats.male, genderStats.female],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',   // Blue
                    'rgba(236, 72, 153, 0.8)',    // Pink
                ],
                borderColor: [
                    'rgba(37, 99, 235, 1)',      // Darker Blue
                    'rgba(219, 39, 119, 1)',      // Darker Pink
                ],
                borderWidth: 2,
                hoverBackgroundColor: [
                    'rgba(59, 130, 246, 0.9)',   // Blue (hover)
                    'rgba(236, 72, 153, 0.9)',    // Pink (hover)
                ],
                hoverBorderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart' as const,
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    },
                    color: '#64748b'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem: TooltipItem<'doughnut'>) {
                        const value = tooltipItem.parsed;
                        const total = genderStats.male + genderStats.female;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    }
                },
                padding: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                }
            }
        },
        cutout: '65%',
        radius: '85%',
    };

    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <div className="w-48 h-48 rounded-full animate-pulse bg-blue-100 dark:bg-blue-900">
                    <div className="w-32 h-32 rounded-full bg-pink-100 dark:bg-pink-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>
        );
    }

    if (genderStats.male === 0 && genderStats.female === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p className="text-lg">No gender data available</p>
                    <p className="text-sm mt-2">Please add employee information</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[300px] flex items-center justify-center p-4">
            <Chart 
                type="doughnut" 
                data={data} 
                options={options}
            />
        </div>
    );
}