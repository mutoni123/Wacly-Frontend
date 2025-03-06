// components/ProfileForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
    department?: string;
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
}

interface ProfileFormProps {
    userId?: string;
    readOnly?: boolean;
    onUpdate?: (data: ProfileData) => void;
}

interface UpdateData {
    firstName: string;
    lastName: string;
    current_password?: string;
    new_password?: string;
}

export function ProfileForm({ readOnly = false, onUpdate }: ProfileFormProps) {
    const { toast } = useToast();
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        first_name: '',
        last_name: '',
        email: '',
    });

    const fetchProfile = useCallback(async () => {
        if (user) {
            setProfileData({
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                role: user.role,
                department: user.department,
            });
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const updateData: UpdateData = {
                firstName: profileData.first_name,
                lastName: profileData.last_name,
            };

            if (showPasswordChange) {
                if (profileData.new_password !== profileData.confirm_password) {
                    throw new Error('New passwords do not match');
                }
                updateData.current_password = profileData.current_password;
                updateData.new_password = profileData.new_password;
            }

            await updateProfile(updateData);

            toast({
                title: "Success",
                description: "Profile updated successfully",
                variant: "default",
                className: "bg-green-500 text-white",
            });

            if (showPasswordChange) {
                setProfileData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                }));
                setShowPasswordChange(false);
            }

            if (onUpdate) {
                onUpdate(profileData);
            }
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleChange}
                                required
                                readOnly={readOnly}
                                className={readOnly ? "bg-gray-50" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleChange}
                                required
                                readOnly={readOnly}
                                className={readOnly ? "bg-gray-50" : ""}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>

                    {profileData.role && (
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input
                                value={profileData.role}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                    )}

                    {profileData.department && (
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Input
                                value={profileData.department}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                    )}

                    {!readOnly && (
                        <>
                            <div className="space-y-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                                >
                                    {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
                                </Button>

                                {showPasswordChange && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <Input
                                                id="current_password"
                                                name="current_password"
                                                type="password"
                                                value={profileData.current_password || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password">New Password</Label>
                                            <Input
                                                id="new_password"
                                                name="new_password"
                                                type="password"
                                                value={profileData.new_password || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm_password">Confirm New Password</Label>
                                            <Input
                                                id="confirm_password"
                                                name="confirm_password"
                                                type="password"
                                                value={profileData.confirm_password || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={updating}>
                                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}