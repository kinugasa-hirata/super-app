import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import prisma from '@/lib/prisma';

const readFile = promisify(fs.readFile);

// Register handlebars helper
handlebars.registerHelper('formatCurrency', function(value) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the estimate ID from the query parameters
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Estimate ID is required' }, { status: 400 });
  }

  try {
    // Get the estimate from the database
    const estimate = await prisma.estimate.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!estimate) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }
    
    // Read the HTML template
    const templatePath = path.join(process.cwd(), 'templates', 'estimate-template.html');
    const templateHtml = await readFile(templatePath, 'utf8');
    
    // Compile the template with Handlebars
    const template = handlebars.compile(templateHtml);
    const html = template(estimate);
    
    // Launch Puppeteer with chrome-aws-lambda
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: process.env.NODE_ENV === 'production' 
        ? await chromium.executablePath 
        : '/usr/bin/google-chrome',
      headless: true
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });
    
    await browser.close();
    
    // Return the PDF as response
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=estimate-${estimate.estimateNumber}.pdf`
      }
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}