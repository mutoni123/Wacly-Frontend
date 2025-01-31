export default function Timeline() {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="min-w-[60px] text-sm text-gray-500">Jun 15</div>
          <div>
            <p className="font-medium">Monthly Payroll</p>
            <p className="text-sm text-gray-500">Salary disbursement</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="min-w-[60px] text-sm text-gray-500">Jun 18</div>
          <div>
            <p className="font-medium">John Doe - Leave</p>
            <p className="text-sm text-gray-500">Vacation starts</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="min-w-[60px] text-sm text-gray-500">Jun 20</div>
          <div>
            <p className="font-medium">Team Meeting</p>
            <p className="text-sm text-gray-500">Quarterly review</p>
          </div>
        </div>
      </div>
    );
  }