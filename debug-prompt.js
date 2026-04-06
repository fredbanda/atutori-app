const { PrismaClient } = require('@prisma/client');

async function debugPrompt() {
  const prisma = new PrismaClient();
  
  try {
    // Check the counting subject prompt
    const countingPrompt = await prisma.subjectPrompt.findFirst({
      where: {
        subjectId: 'counting',
        grade: 1,
        isActive: true
      }
    });
    
    if (!countingPrompt) {
      console.log('❌ No counting prompt found');
      return;
    }
    
    console.log('✅ Found counting prompt:');
    console.log('- Subject:', countingPrompt.subjectId);
    console.log('- Grade:', countingPrompt.grade);
    console.log('- Quiz Count:', countingPrompt.quizCount);
    console.log('- Content Steps:', countingPrompt.contentSteps);
    console.log('- System Prompt Length:', countingPrompt.systemPrompt?.length || 0);
    console.log('- User Prompt Length:', countingPrompt.userPrompt?.length || 0);
    
    // Check if prompts are empty
    if (!countingPrompt.systemPrompt || !countingPrompt.userPrompt) {
      console.log('❌ Empty prompts detected!');
      console.log('System Prompt:', countingPrompt.systemPrompt ? 'EXISTS' : 'NULL');
      console.log('User Prompt:', countingPrompt.userPrompt ? 'EXISTS' : 'NULL');
    }
    
    // Sample the first 200 chars of each prompt
    console.log('\nSystem Prompt Preview:');
    console.log(countingPrompt.systemPrompt?.substring(0, 200) + '...');
    
    console.log('\nUser Prompt Preview:');
    console.log(countingPrompt.userPrompt?.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPrompt();