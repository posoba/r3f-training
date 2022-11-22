import { Html } from "@react-three/drei";

interface Props {
    onClick: () => void;
}

function PlayButton({ onClick }: Props) {
    return (
        <Html
            center
            calculatePosition={() => {
                return [window.innerWidth / 2, window.innerHeight - 100];
            }}
        >
            <button
                style={{
                    cursor: "pointer",
                    fontSize: 50,
                }}
                onClick={onClick}
            >
                PLAY
            </button>
        </Html>
    );
}

export default PlayButton;
