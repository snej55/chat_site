import './Loading.css';

export function LoadingPage() {
    return (
        <div className="loading-wrapper">
            <div className="loading-text">
                <span className="loading-text-letter">L</span>
                <span>o</span>
                <span>a</span>
                <span>d</span>
                <span>i</span>
                <span>n</span>
                <span>g</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </div>
            <div className="loading-support">
                If this takes too long, try refreshing the page.
            </div>
            <div className="loading-text-wrapper"></div>
        </div>
    )
}