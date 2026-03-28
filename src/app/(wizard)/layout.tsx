import { AppHeader } from '@/components/AppHeader'

export default function WizardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppHeader />
      <div className="pt-14">
        {children}
      </div>
    </>
  )
}
