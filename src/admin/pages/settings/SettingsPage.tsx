import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, CreditCard, Truck, Receipt, Mail, Bell, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { Textarea } from '../../components/ui/Textarea';
import { fadeVariants } from '../../animations/variants';

const tabs = [
  { id: 'store', label: 'Store Details', icon: Store },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'taxes', label: 'Taxes', icon: Receipt },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'staff', label: 'Staff & Roles', icon: Users },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your store configurations and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'bg-admin-deep-forest text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'store' && (
              <motion.div key="store" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>Basic information about your store.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Store Name</Label>
                        <Input defaultValue="9/10 Mart" />
                      </div>
                      <div className="space-y-2">
                        <Label>Legal Business Name</Label>
                        <Input defaultValue="9/10 Mart Pvt. Ltd." />
                      </div>
                      <div className="space-y-2">
                        <Label>Store Email</Label>
                        <Input defaultValue="support@910mart.com" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input defaultValue="+977 1-4000000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Store Description</Label>
                      <Textarea defaultValue="Premium luxury alcohol marketplace in Nepal." className="h-24" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Store Address</CardTitle>
                    <CardDescription>The primary physical address of your business.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Address Line 1</Label>
                      <Input defaultValue="Durbar Marg" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input defaultValue="Kathmandu" />
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input defaultValue="44600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button className="w-full md:w-auto">Save Changes</Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div key="payments" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Configure how your customers can pay for their orders.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">eSewa</Label>
                        <p className="text-sm text-slate-500">Accept payments via eSewa digital wallet.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Khalti</Label>
                        <p className="text-sm text-slate-500">Accept payments via Khalti digital wallet.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Cash on Delivery (COD)</Label>
                        <p className="text-sm text-slate-500">Allow customers to pay upon delivery.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button className="w-full md:w-auto">Save Preferences</Button>
                </div>
              </motion.div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== 'store' && activeTab !== 'payments' && (
              <motion.div key="other" variants={fadeVariants} initial="initial" animate="animate" exit="exit">
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">{activeTab} Settings</CardTitle>
                    <CardDescription>Manage your {activeTab} preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
                    <Settings className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium text-slate-600">Configuration area for {activeTab}</p>
                    <p className="text-xs mt-1">This section is being developed.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Temporary icon for empty states
function Settings(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
