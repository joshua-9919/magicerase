import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const maskFile = formData.get('mask') as File;

    console.log('📥 收到请求');
    if (!imageFile || !maskFile) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 });
    }

    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Token 未配置' }, { status: 500 });
    }

    // 转 base64
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const maskBuffer = await maskFile.arrayBuffer();
    const maskBase64 = Buffer.from(maskBuffer).toString('base64');

    console.log('🚀 调用 Replicate API...');

    // 使用正确的模型
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a4565d35f9e9e6e1f8e1f8e1f8e1f8e1f8e1f8e1f8e1f8e1f8e1f8e1f8e1f8e1',
        input: {
          image: `data:image/jpeg;base64,${imageBase64}`,
          mask: `data:image/png;base64,${maskBase64}`,
        },
      }),
    });

    console.log('📡 创建预测:', createResponse.status);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ 创建失败:', errorText);
      return NextResponse.json({ error: errorText }, { status: createResponse.status });
    }

    const prediction = await createResponse.json();
    console.log('📊 预测 ID:', prediction.id);

    // 轮询结果
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      });

      const status = await statusResponse.json();
      console.log('📊 状态:', status.status, `(${i + 1}/60)`);

      if (status.status === 'succeeded') {
        const imageUrl = Array.isArray(status.output) ? status.output[0] : status.output;
        console.log('✅ 成功:', imageUrl);
        
        const imageResponse = await fetch(imageUrl);
        const resultBuffer = await imageResponse.arrayBuffer();
        
        return new NextResponse(resultBuffer, {
          headers: { 'content-type': 'image/png' },
        });
      } else if (status.status === 'failed') {
        throw new Error(status.error || '处理失败');
      }
    }

    throw new Error('处理超时');
  } catch (error) {
    console.error('❌ 错误:', error);
    return NextResponse.json(
      { error: '处理失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
