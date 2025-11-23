FROM public.ecr.aws/lambda/nodejs:20

# Instalar dependencias de producción
WORKDIR ${LAMBDA_TASK_ROOT}
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado
COPY dist/ ${LAMBDA_TASK_ROOT}/

# Establecer el handler
CMD [ "lambda.handler" ]

