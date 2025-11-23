const { execSync } = require('child_process');
const path = require('path');

const stage = process.argv[2] || 'dev';
const region = 'us-east-1';
const accountId = '754881596744';
const repoName = 'vyva-api';
const imageName = 'vyva-api';
const ecrUri = `${accountId}.dkr.ecr.${region}.amazonaws.com/${repoName}`;

console.log(`Building and pushing Docker image for stage: ${stage}`);

try {
  // Autenticar con ECR
  console.log('Authenticating with ECR...');
  execSync(
    `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${ecrUri}`,
    { stdio: 'inherit' },
  );

  // Construir la imagen
  console.log('Building Docker image...');
  execSync(`docker build -t ${imageName}:${stage} .`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  // Taggear para ECR
  console.log('Tagging image for ECR...');
  execSync(`docker tag ${imageName}:${stage} ${ecrUri}:${stage}`, {
    stdio: 'inherit',
  });

  // Subir a ECR
  console.log('Pushing image to ECR...');
  execSync(`docker push ${ecrUri}:${stage}`, {
    stdio: 'inherit',
  });

  console.log(`✓ Image ${ecrUri}:${stage} pushed successfully`);
} catch (error) {
  console.error('Error building/pushing image:', error.message);
  process.exit(1);
}
