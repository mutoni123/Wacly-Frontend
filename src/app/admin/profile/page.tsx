'use client';

import { ProfileForm } from "@/components/ProfileForm";
import { Card } from "@/components/ui/card";

export default function AdminProfilePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
            </div>
            <Card className="p-6">
                <ProfileForm />
            </Card>
        </div>
    );
}