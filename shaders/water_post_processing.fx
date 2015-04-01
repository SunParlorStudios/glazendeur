cbuffer Global : register(b0)
{
	float Time;
	float4x4 View;
	float4x4 Projection;
	float4 EyePosition;
	float4x4 InvViewProjection;
}

cbuffer Uniforms : register(b2)
{

}

struct VOut
{
	float4 position : SV_POSITION;
	float4 colour : COLOUR;
	float2 texcoord : TEXCOORD0;
	float3 normal : NORMAL;
};

VOut VS(float4 position : POSITION, float4 colour : COLOUR, float2 texcoord : TEXCOORD0, float3 normal : NORMAL)
{
	VOut output;
	output.position = position;
	output.normal = normal;
	output.texcoord = texcoord;
	output.colour = colour;
	return output;
}

Texture2D Target : register(t0);
Texture2D Shore : register(t1);
SamplerState Sampler;

float4 PS(VOut input) : SV_TARGET
{
	float4 shore = Shore.Sample(Sampler, input.texcoord);
	float4 final = Target.Sample(Sampler, input.texcoord);
	if (shore.a == 0)
	{
		shore.a = 1;
		shore.rgb = 1;
	}
	final.rgb = lerp(final.rgb, float3(0.7,0.8,1), pow(1 - shore.r + 0.25, 5));
	final.a *= shore.r;

	return final;
}