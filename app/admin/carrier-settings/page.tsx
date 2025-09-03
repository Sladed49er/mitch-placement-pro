import AgencyCarrierSettings from '@/app/components/AgencyCarrierSettings';

export default function CarrierSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Carrier Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your carrier appointments, commissions, and performance metrics
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Export Data
              </button>
              <button className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Add Carrier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <a href="/" className="text-gray-400 hover:text-gray-500">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="sr-only">Home</span>
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <a href="/admin" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Admin
                </a>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">
                  Carrier Settings
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content - Agency Carrier Settings Component */}
      <AgencyCarrierSettings />

      {/* Quick Stats Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-4">
            <button className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-gray-900">Download Appetite Guide</div>
              <div className="text-xs text-gray-500 mt-1">Export carrier appetites as PDF</div>
            </button>
            <button className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-gray-900">Update Commissions</div>
              <div className="text-xs text-gray-500 mt-1">Bulk update commission rates</div>
            </button>
            <button className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-gray-900">Sync with BMS</div>
              <div className="text-xs text-gray-500 mt-1">Import data from your system</div>
            </button>
            <button className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-gray-900">Performance Report</div>
              <div className="text-xs text-gray-500 mt-1">Generate carrier report</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}