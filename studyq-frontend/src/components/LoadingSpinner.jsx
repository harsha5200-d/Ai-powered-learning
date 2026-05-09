export default function LoadingSpinner({ fullscreen = false }) {
    if (fullscreen) {
        return (
            <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
                <Spinner />
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center py-12">
            <Spinner />
        </div>
    );
}

function Spinner() {
    return (
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-surface-300" />
            <div className="absolute inset-0 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
    );
}
