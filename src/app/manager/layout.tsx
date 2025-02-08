import Header from '@/components/Managerheader';
import Sidebar from '@/components/ManagerSidebar';


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
