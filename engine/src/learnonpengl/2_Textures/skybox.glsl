#type vertex
#version 300 es
in vec3 aPos;

out vec3 TexCoord;

uniform mat4 view;
uniform mat4 projection;

void main()
{
	TexCoord = aPos;
    vec4 pos = projection * view * vec4(aPos, 1.0);
	gl_Position = pos.xyww;
}

#type fragment
#version 300 es
precision mediump float;

out vec4 FragColor;

in vec3 TexCoord;

uniform samplerCube skybox;

void main()
{
	FragColor = texture(skybox, TexCoord);
}