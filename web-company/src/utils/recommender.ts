interface Product {
    id: number;
    title: string;
    likes: number;
    category: string;
}

export class Recommender {
    private products: Product[];
    private similarityMatrix: number[][];

    constructor(products: Product[]) {
        this.products = products;
        this.similarityMatrix = this.calculateSimilarityMatrix();
    }

    private calculateSimilarityMatrix(): number[][] {
        const n = this.products.length;
        const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const similarity = this.calculateSimilarity(this.products[i], this.products[j]);
                matrix[i][j] = similarity;
                matrix[j][i] = similarity;
            }
            matrix[i][i] = 1;
        }

        return matrix;
    }

    private calculateSimilarity(product1: Product, product2: Product): number {
        // 基于点赞数和类别的相似度计算
        const likeSimilarity = 1 - Math.abs(product1.likes - product2.likes) / Math.max(product1.likes, product2.likes);
        const categorySimilarity = product1.category === product2.category ? 1 : 0;
        
        // 综合相似度（点赞权重0.7，类别权重0.3）
        return 0.7 * likeSimilarity + 0.3 * categorySimilarity;
    }

    public getRecommendations(productId: number, numRecommendations: number = 3): Product[] {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex === -1) return [];

        const similarities = this.similarityMatrix[productIndex];
        const recommendations = this.products
            .map((product, index) => ({
                product,
                similarity: similarities[index]
            }))
            .filter(item => item.product.id !== productId)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, numRecommendations)
            .map(item => item.product);

        return recommendations;
    }
} 