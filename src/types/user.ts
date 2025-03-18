// types/user.ts
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department_id: string;  
    department: {
        id: string;
        name: string;
    };
}