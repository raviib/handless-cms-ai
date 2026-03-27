export async function PUT() {
    try {
        return NextResponse.json({
            success: true,
          
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}