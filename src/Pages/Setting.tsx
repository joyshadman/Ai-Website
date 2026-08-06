import { AccountSettingsCards } from '@daveyplate/better-auth-ui'

const Setting = () => {
    const midnightStyles = {
        base: 'bg-indigo-950/20 backdrop-blur-sm ring-1 ring-indigo-500/30 max-w-2xl mx-auto rounded-xl border-none shadow-2xl',
        footer: 'bg-indigo-950/40 border-t border-indigo-500/20'
    };

    return (
        <div className="min-h-screen bg-[#02020a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#02020a] to-[#02020a] text-slate-100 py-12 px-4">
            <div className="w-full max-w-2xl mx-auto space-y-10 mt-50">
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        Account Settings
                    </h1>
                    <p className="text-indigo-300/60 font-medium">
                        Manage your name, email and security preferences.
                    </p>
                </div>
                <div className="w-full">
                    <AccountSettingsCards 
                        classNames={{
                            card: midnightStyles
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Setting