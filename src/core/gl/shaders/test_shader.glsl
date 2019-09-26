#type vertex
#version 300 es
in vec3 aPos;
in vec2 aTexCoord;
out vec2 TexCoord;

uniform mat4 transform;

void main()
{
	gl_Position = transform * vec4(aPos, 1.0);
	// gl_Position = vec4(aPos, 1.0);
	TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}

#type fragment
#version 300 es
precision mediump float;
out vec4 FragColor;

in vec2 TexCoord;

// texture samplers
uniform sampler2D texture1;
uniform sampler2D texture2;

void main()
{
	// linearly interpolate between both textures (80% container, 20% awesomeface)
	vec4 diffuse = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
    float alpha = diffuse.a;

    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    FragColor = vec4(diffuse.rgb * color.rgb, alpha - (1.0 - color.a));
}