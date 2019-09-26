#type vertex
#version 300 es
in vec4 a_position; // the position variable has attribute position 0
// in vec2 a_texCoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

out vec2 TexCoords;

void main()
{
    vec4 fragPos = u_model * vec4(a_position.xy, 0.0, 1.0);
    gl_Position = u_projection * u_view * fragPos;

    TexCoords = a_position.zw;
}

#type fragment
#version 300 es
precision mediump float;

in vec2 TexCoords;

uniform sampler2D t_diffuse;
uniform vec4 u_color;

out vec4 FragColor;

void main()
{
    vec4 cDiffuse = texture(t_diffuse, TexCoords);
    float alpha = cDiffuse.a;

    // FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    FragColor = vec4(cDiffuse.rgb * u_color.rgb, alpha - (1.0 - u_color.a));
} 