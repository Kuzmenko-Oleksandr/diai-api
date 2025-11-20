import type { MultipartFile } from "@fastify/multipart";
import type { FastifyPluginAsync } from "fastify";
import { AiRecognitionService } from "@/modules/ai-recognition/ai-recognition-service";

const ai: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	fastify.post<{
		Body: {
			images: MultipartFile[];
		};
	}>(
		"/plate",
		{
			schema: {
				tags: ["AI"],
				consumes: ["multipart/form-data"],
				body: {
					type: "object",
					properties: {
						images: {
							type: "array",
							items: { isFile: true },
						},
					},
				},
			},
			preValidation: (request, _reply, done) => {
				const { images } = request.body;
				request.body.images = Array.isArray(images) ? images : [images];
				done();
			},
		},
		async (req, _reply) => {
			const files = await req.saveRequestFiles();

			const imageFiles: File[] = await Promise.all(
				files.map(async (file) => {
					const bytes = await file.toBuffer();
					const { filename, mimetype } = file;

					return new File([bytes], filename, { type: mimetype });
				}),
			);

			const result = await AiRecognitionService.getPlateDetails(imageFiles);
			return result;
		},
	);
};

export default ai;
