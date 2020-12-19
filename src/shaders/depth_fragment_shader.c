    precision mediump float;
     
    varying vec2 position;
     
    uniform sampler2D texture;
     
    void main() {
       // depth is just stored in the red channel
       float depth = texture2D(texture, position).x; // / 65535.0;

       // render as a grayscale
        gl_FragColor = vec4(depth, depth, depth, 1.0);
    }