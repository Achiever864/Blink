// import ChatSidebar from "../components/chat/ChatSidebar";
// import ChatHeader from "../components/chat/ChatHeader";
// import MessageInput from "../components/chat/MessageInput";

const ChatPage = () => {
    return(
        <div className="flex h-full flex-row h-screen bg-slate-950 text-white">
            {/*Sidebar*/}
            <aside className="w-80 border-r border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 p-4">
                    <h1 className="text-2xl font-bold text-cyan-400">
                        Blink
                    </h1>

                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-500"
                        />
                </div>

                <div className="space-y-2 p-3">
                    <div className="cursor-pointer rounded-xl bg-slate-800 p-3">
                        <h3 className="font-semibold">John Doe</h3>
                        <p className="text-sm text-slate-400">Hey bro</p>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="rounded-2xl bg-white text-black w-7 text-center ml-1">
                        A
                    </div>
                </div>
            </aside>

            <div className="flex flex-col">
            {/*Chat Area*/}
            <section className="flex flex-1 flex-col">
                {/*Chat Header*/}
                <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                    <div>
                        <h2 className="font-semibold">John Doe</h2>
                        <p className="text-sm text-green-400">Online</p>
                    </div>
                </header>
            </section>

            
            {/*Messages */}
            <main className="flex-1 space-y-4 overflow-y-auto p-6">
                <div className="flex">
                    <div className="max-w-xs rounded-2xl bg-slate-800 px-4 py-3">
                        Helloooooo
                    </div>
                </div>
            </main>

            {/*Input*/}
            <footer className="border-t border-slate-800 p-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-cyan-500"
                    />

                    <button className="rounded-xl bg-cyan-600 px-6 py-3 font-medium hover:bg-cyan--500">
                       Send 
                    </button>
                </div>
            </footer>
        </div>
            
    </div>
    );
};

export default ChatPage;