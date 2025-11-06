/**
 * favicon.ico 생성 스크립트
 * 
 * 기존 PNG 아이콘 파일들을 사용하여 멀티 레이어 favicon.ico를 생성합니다.
 * ICO 파일은 16x16, 32x32, 72x72 크기를 포함하여 다양한 환경에서
 * 최적의 표시를 제공합니다.
 * 
 * 사용법: node generate-favicon.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    console.log('🎨 Favicon.ico 생성 시작...');
    
    const publicDir = path.join(__dirname, 'public');
    
    // 사용할 아이콘 크기
    const iconFiles = [
      'icon-16x16.png',
      'icon-32x32.png',
      'icon-72x72.png'
    ];
    
    // 모든 입력 파일이 존재하는지 확인
    console.log('📁 사용할 아이콘 파일:');
    for (const file of iconFiles) {
      const filePath = path.join(publicDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`아이콘 파일을 찾을 수 없습니다: ${file}`);
      }
      console.log(`   - ${file}`);
    }
    
    // ImageMagick convert 명령어 사용
    const outputPath = path.join(publicDir, 'favicon.ico');
    const inputPaths = iconFiles.map(f => path.join(publicDir, f)).join(' ');
    const command = `convert ${inputPaths} ${outputPath}`;
    
    console.log('🔨 ICO 파일 변환 중...');
    execSync(command, { cwd: publicDir });
    
    if (!fs.existsSync(outputPath)) {
      throw new Error('favicon.ico 파일이 생성되지 않았습니다.');
    }
    
    const stats = fs.statSync(outputPath);
    console.log('✅ favicon.ico 생성 완료!');
    console.log(`📍 위치: ${outputPath}`);
    console.log(`📊 크기: ${(stats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ favicon.ico 생성 실패:', error.message);
    console.error('');
    console.error('⚠️  ImageMagick이 설치되어 있는지 확인하세요:');
    console.error('   Ubuntu/Debian: sudo apt-get install imagemagick');
    console.error('   macOS: brew install imagemagick');
    console.error('   Windows: https://imagemagick.org/script/download.php');
    process.exit(1);
  }
}

generateFavicon();

