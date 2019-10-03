#type vertex
#version 300 es
layout(location = 0) in vec4 a_position;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform vec3 uColor[4];

out vec4 color;

void main()
{
    color = vec4(uColor[ int(a_position.w) ],1.0);
    gl_Position = projection * view * model * vec4(a_position.xyz, 1.0);
}

#type fragment
#version 300 es
precision mediump float;

in vec4 color;
out vec4 FragColor;

void main()
{
    FragColor = color;
} 