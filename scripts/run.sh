#!/bin/bash

# 포트 포워딩 80 -> 3000
sudo iptables -t nat -A PREROUTING -i enX0 -p tcp --dport 80 -j REDIRECT --to-port 3000

# node, npm, yarn 명령어 사용을 위한 설정 (.bashrc 파일에 추가되어 있는 내용)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# PM2로 실행 중인 서버 중지 및 삭제
pm2 delete hunsu-project

# 서버를 PM2로 실행
NODE_ENV=production && pm2 --name hunsu-project  start dist/main.js

# PM2 설정 저장 (선택사항, startup 설정을 해놨다면)
pm2 save

# 변수 선언: 탬플릿 ID
template_id="lt-05a65521cd71aa23d" # 알맞게 수정

# 현재 인스턴스의 id를 가져온다.
id=$(ec2-metadata -i | grep "instance-id" | awk '{print $2}')
echo "Current Instance ID: $id"

# 현재 인스턴스의 region을 가져온다.
region=$(ec2-metadata -z | grep "placement" | awk '{print $2}' | sed 's/[a-z]$//')
echo "Current Region: $region"

# image_name을 만든다.
image_name="5zirap-service-$(date +%Y%m%d%H%M%S)" # 알맞게 수정
echo "Creating new EC2 instance image : $image_name"

# image_name을 통해 새로운 AMI (이미지)를 생성
new_ami_id=$(aws ec2 create-image --instance-id $id --name $image_name --no-reboot --query 'ImageId' --output text)
echo "New AMI ID: $new_ami_id"

# AMI가 생성될 때까지 대기
echo "Waiting for AMI to be available..."
aws ec2 wait image-available --image-ids $new_ami_id
echo "AMI is available now."

# 새로 생성된 AMI를 탬플릿에 적용
echo "Fetching the latest launch template version..."

# 현재 탬플릿 버전 체크
current_version=$(aws ec2 describe-launch-template-versions --launch-template-id $template_id --query 'LaunchTemplateVersions | sort_by(@, &VersionNumber) | [-1].VersionNumber' --output text --region $region)
echo "Current launch template version: $current_version"

# 업데이트된 탬플릿 버전 체크
new_version_number=$(aws ec2 create-launch-template-version --launch-template-id $template_id --source-version $current_version --launch-template-data "{\"ImageId\":\"$new_ami_id\"}" --query 'LaunchTemplateVersion.VersionNumber' --output text)
echo "New launch template version: $new_version_number"

# 탬플릿의 default 버전을 최신 버전으로 업데이트
echo "Updating default version of the launch template..."
aws ec2 modify-launch-template --launch-template-id $template_id --default-version $new_version_number --region $region
echo "Launch template default version updated to $new_version_number"

# Auto Scaling 그룹의 인스턴스를 중지
echo "Stopping instances in the Auto Scaling group..." 
AUTO_SCALING_GROUP_NAME="hunsu-project-asg" # 알맞게 수정

AUTO_SCALING_GROUP=$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names $AUTO_SCALING_GROUP_NAME)
echo "AUTO_SCALING_GROUP : $AUTO_SCALING_GROUP"

# Auto Scaling 그룹 이름 확인
AUTO_SCALING_GROUP_NAME=$(echo $AUTO_SCALING_GROUP | jq -r '.AutoScalingGroups[0].AutoScalingGroupName')
echo "AUTO_SCALING_GROUP_NAME : $AUTO_SCALING_GROUP_NAME"

# 인스턴스 ID 확인
INSTANCE_IDS=$(echo $AUTO_SCALING_GROUP | jq -r '.AutoScalingGroups[0].Instances[]?.InstanceId')
echo "INSTANCE_IDS: $INSTANCE_IDS"

# 인스턴스 중지
for INSTANCE_ID in $INSTANCE_IDS 
do 
    echo "Terminating instance $INSTANCE_ID" 
    aws ec2 terminate-instances --instance-ids $INSTANCE_ID 
done 

echo "All instances in the Auto Scaling group have been terminated."