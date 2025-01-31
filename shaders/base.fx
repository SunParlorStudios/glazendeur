cbuffer Global : register(b0)
{
	float Time;
	float4x4 View;
	float4x4 Projection;
	float4 EyePosition;
}

struct Attributes
{
	float4 Diffuse;
	float4 Ambient;

	float SpecularPower;
	float SpecularIntensity;
	float Reflectivity;
	float NormalScale;
	float Emissive;
};

cbuffer PerObject : register(b1)
{
	float4x4 World;
	float4x4 InvWorld;
	float4 AnimationCoords;
	float3 Blend;
	float Alpha;

	Attributes Material;
}

cbuffer Uniforms : register(b2)
{

}

struct VOut
{
	float4 position : SV_POSITION;
	float4 colour : COLOUR;
	float2 texcoord : TEXCOORD0;
	float3 normal : TEXCOORD1;
	float3 tangent : TEXCOORD2;
	float3 bitangent : TEXCOORD3;
	float4 world_pos : TEXCOORD4;
	float depth : TEXCOORD5;
};

VOut VS(float4 position : POSITION, float4 colour : COLOUR, float2 texcoord : TEXCOORD0, float3 normal : NORMAL, float3 tangent : TANGENT, float3 bitangent : BITANGENT)
{
	VOut output;
	output.world_pos = mul(position, World);
	output.position = mul(position, World);
	output.position = mul(output.position, View);
	output.position = mul(output.position, Projection);
	output.normal = normalize(mul(normal, (float3x3)InvWorld));
	output.tangent = normalize(mul(tangent, (float3x3)InvWorld));
	output.bitangent = normalize(mul(bitangent, (float3x3)InvWorld));
	output.texcoord = texcoord;
	output.colour = colour;
	output.depth = 1 - output.position.z / output.position.w;
	return output;
}

TextureCube TexCube : register(t0);
Texture2D TexDiffuse : register(t1);
Texture2D TexNormal : register(t2);
Texture2D TexSpecular : register(t3);
Texture2D TexLight : register(t4);

SamplerState Sampler;

struct PSOut
{
	float4 colour : SV_Target0;
	float4 normal : SV_Target1;
	float4 ambient : SV_Target2;
	float4 shore : SV_Target3;
};
float4 Reflection(float4 p, float4 eye, float3 normal)
{
	normal.y *= -1;
	float3 i = normalize(p.xyz - eye.xyz);
	float3 r = reflect(i, normal.xyz);
	return TexCube.Sample(Sampler, r);
}

PSOut PS(VOut input)
{
	PSOut output;

	float x = (input.texcoord.x * AnimationCoords.z) + AnimationCoords.x;
	float y = (input.texcoord.y * AnimationCoords.w) + AnimationCoords.y;
	float2 coords = float2(x, y);

	float4 diffuse = TexDiffuse.Sample(Sampler, coords);
	clip(diffuse.a - 0.9);

	float4 normal = normalize(TexNormal.Sample(Sampler, coords) * 2.0f - 1.0f);
	normal.rgb = lerp(normal.rgb, float3(0, 0, 1), 0.25);

	normal = float4((normal.x * input.tangent) + (normal.y * input.bitangent) + (normal.z * input.normal), 1.0f);

	float4 r = Reflection(input.world_pos, EyePosition, input.normal.rgb);
	float spec = saturate(Material.SpecularIntensity * TexSpecular.Sample(Sampler, coords).r);

	output.colour = lerp(diffuse, r, saturate(Material.Reflectivity)) * Material.Diffuse * float4(Blend, 1.0f) * input.colour;
	output.colour.a = Material.SpecularPower / 256;
	output.normal = float4((normal.rgb + 1.0f) / 2.0f, spec);
	output.ambient = float4(Material.Ambient.rgb, saturate(TexLight.Sample(Sampler, coords).r * Material.Emissive));
	output.shore = input.world_pos.y / 25;
	output.shore.a = 1;

	return output;
}