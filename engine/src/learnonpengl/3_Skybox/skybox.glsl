#type vertex
#version 300 es
layout(location=0) in vec4 aPos;

out vec3 TexCoord;

uniform mat4 view;
uniform mat4 projection;

void main()
{
	TexCoord = aPos.xyz;
    vec4 pos = projection * view * vec4(aPos.xyz, 1.0);
	gl_Position = pos.xyww;
}

#type fragment
#version 300 es
precision mediump float;

in vec3 TexCoord;

out vec4 FragColor;

uniform samplerCube texture0;

void main()
{
	FragColor = texture(texture0, TexCoord);
}