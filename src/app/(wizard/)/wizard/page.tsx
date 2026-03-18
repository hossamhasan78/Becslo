export default function WizardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="max-w-4xl w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Wizard Placeholder</h1>

        <div className="text-center text-gray-600 mb-8">
          <p className="mb-4">The wizard is currently under development.</p>
          <p className="text-sm text-gray-500">Features coming soon:</p>
          <ul className="list-disc list-inside space-y-4 ml-6 text-gray-500">
            <li>✓ Authentication</li>
            <li>✓ Wizard Layout</li>
            <li>✓ Email/Password Authentication</li>
            <li>⏳ Service Selection</li>
            <li>⏳ Fee Calculation</li>
            <li>⏳ PDF Export</li>
            <li>⏳ Admin Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
