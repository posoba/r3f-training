import { ShaderMaterial, Vector4, Color } from "three";
import { events, actions } from "../../events";

const fragmentShader = `    
	uniform float time;    
	uniform vec4 startColor;
	uniform vec4 endColor;
	varying vec2 vUv;

	void main()
	{   
		vec2 uv = vUv - 0.5;
		float angle = radians(time * 36.0) + atan(uv.x, uv.y);
		float x = cos(angle) * length(uv) + 0.5;
		gl_FragColor = mix(startColor, endColor, x);
	}
`;

const vertexShader = `
    varying vec2 vUv;

    void main()
    {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const timeUniform = { value: 0 };

function updateTime(delta: number) {
    timeUniform.value += delta;
}

events.on(actions.UPDATE, updateTime);

const color = new Color();
function makeFrontShaderMaterial(colors: number[]) {
    color.set(colors[0]);
    const startColor = new Vector4(color.r, color.g, color.b, 1);
    color.set(colors[1]);
    const endColor = new Vector4(color.r, color.g, color.b, 1);

    return new ShaderMaterial({
        uniforms: {
            time: timeUniform,
            startColor: { value: startColor },
            endColor: { value: endColor },
        },
        vertexShader,
        fragmentShader,
    });
}

export default makeFrontShaderMaterial;
