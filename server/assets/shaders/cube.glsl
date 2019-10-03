#type vertex
#version 300 es
layout(location=0) in vec4 aPos;
layout(location=1) in vec3 aNorm;
layout(location=2) in vec2 aTexCoord;

out vec2 TexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
	gl_Position = projection * view * model * vec4(aPos.xyz, 1.0);
	TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}

#type fragment
#version 300 es
precision mediump float;

out vec4 FragColor;

in vec2 TexCoord;

// texture samplers
uniform sampler2D texture0;

void main()
{
    vec4 color0 = texture(texture0, TexCoord);

	// linearly interpolate between both textures (80% container, 20% awesomeface)
	FragColor = texture(texture0, TexCoord);
}