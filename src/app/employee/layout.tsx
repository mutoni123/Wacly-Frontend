import Header from '@/components/Employeeheader';
import Sidebar from '@/components/Employeesidebar';


export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
    
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Sidebar */}
        <Header/>
        {children}
      </div>
    </div>
  );
}
