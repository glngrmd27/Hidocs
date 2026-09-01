package router

import (
	"backend/internal/domain"
	"backend/internal/infrastructure/security"
	"backend/internal/interfaces/http/handler"
	"backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type RouterConfig struct {
	AuthHandler     *handler.AuthHandler
	UserHandler     *handler.UserHandler
	FormHandler     *handler.FormHandler
	QuestionHandler *handler.QuestionHandler
	ResponseHandler *handler.ResponseHandler
	PublicHandler   *handler.PublicHandler
	AdminHandler    *handler.AdminHandler
	MetricsHandler  *handler.MetricsHandler
	JWTManager      *security.JWTManager
}

func SetupRouter(cfg *RouterConfig) *gin.Engine {
	r := gin.New()
	if gin.Mode() == gin.DebugMode {
		r.Use(gin.Logger(), gin.Recovery())
	} else {
		r.Use(gin.Recovery())
	}
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimiter(500)) // Max 500 requests per minute per IP
	r.Use(middleware.TrackMetrics())    // Telemetry & Traffic Collector Middleware

	// Serve Uploaded Local Images Static Files
	r.Static("/uploads", "./uploads")

	// Swagger API Docs
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Healthcheck
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "app": "HiDocs Backend API"})
	})

	api := r.Group("/api/v1")
	{
		// 1. Access Short Link / Public Forms
		public := api.Group("/public")
		{
			public.GET("/forms/:short_code", cfg.PublicHandler.GetPublicForm)
			public.GET("/forms/:short_code/qr", cfg.PublicHandler.GetFormQRCode)
		}

		// 2. Authentication & OTP Verification
		auth := api.Group("/auth")
		{
			auth.POST("/register", cfg.AuthHandler.Register)
			auth.POST("/verify-otp", cfg.AuthHandler.VerifyOTP)
			auth.POST("/resend-otp", cfg.AuthHandler.ResendOTP)
			auth.POST("/login", cfg.AuthHandler.Login)
			auth.POST("/forgot-password", cfg.AuthHandler.ForgotPassword)
			auth.POST("/reset-password", cfg.AuthHandler.ResetPassword)
		}

		// Authenticated Routes
		protected := api.Group("")
		protected.Use(middleware.RequireAuth(cfg.JWTManager))
		{
			// 3. User Profile & Student Import
			users := protected.Group("/users")
			{
				users.GET("/me", cfg.UserHandler.GetProfile)
				users.PUT("/me", cfg.UserHandler.UpdateProfile)
				users.POST("/students/import", cfg.UserHandler.ImportStudents)
			}

			// 4. Forms & Settings
			forms := protected.Group("/forms")
			{
				forms.GET("", cfg.FormHandler.ListForms)
				forms.POST("", cfg.FormHandler.CreateForm)
				forms.POST("/import-docx", cfg.FormHandler.ImportDocx)
				forms.POST("/import-excel", cfg.FormHandler.ImportExcel)
				forms.GET("/:form_id", cfg.FormHandler.GetFormByID)
				forms.PUT("/:form_id", cfg.FormHandler.UpdateForm)
				forms.DELETE("/:form_id", cfg.FormHandler.DeleteForm)
				forms.PUT("/:form_id/settings", cfg.FormHandler.UpdateFormSettings)

				// Questions under form
				forms.GET("/:form_id/questions", cfg.QuestionHandler.GetQuestionsByFormID)
				forms.POST("/:form_id/questions", cfg.QuestionHandler.AddQuestion)

				// Responses & Submissions under form
				forms.GET("/:form_id/responses", cfg.ResponseHandler.GetFormResponses)
				forms.GET("/:form_id/export", cfg.ResponseHandler.ExportResponses)
				forms.GET("/:form_id/analytics", cfg.ResponseHandler.GetAnalytics)
			}

			// Public Submit Endpoint (or with passcode)
			api.POST("/forms/:form_id/submit", cfg.ResponseHandler.SubmitForm)

			// 5. Questions, Options & Local Image Storage Upload
			questions := protected.Group("/questions")
			{
				questions.POST("/upload-image", cfg.QuestionHandler.UploadImage)
				questions.PUT("/:question_id", cfg.QuestionHandler.UpdateQuestion)
				questions.DELETE("/:question_id", cfg.QuestionHandler.DeleteQuestion)
			}
			options := protected.Group("/options")
			{
				options.DELETE("/:option_id", cfg.QuestionHandler.DeleteOption)
			}

			// 6. Responses & Grading
			responses := protected.Group("/responses")
			{
				responses.GET("/me", cfg.ResponseHandler.GetMySubmissions)
				responses.GET("/:response_id", cfg.ResponseHandler.GetResponseByID)
				responses.PUT("/:response_id/grade", cfg.ResponseHandler.GradeResponse)
			}

			// 7. Admin Exclusive Endpoints
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireRole(domain.RoleAdmin, domain.RoleSuperAdmin))
			{
				admin.GET("/dashboard/stats", cfg.AdminHandler.GetDashboardStats)
				admin.GET("/creators", cfg.AdminHandler.ListCreators)
				admin.POST("/creators", cfg.AdminHandler.CreateCreator)
				admin.PUT("/creators/:creator_id/status", cfg.AdminHandler.UpdateCreatorStatus)
				admin.GET("/forms", cfg.AdminHandler.ListAllForms)
				admin.DELETE("/forms/:form_id", cfg.AdminHandler.DeleteForm)

				// Realtime Metrics & Telemetry Endpoints
				metricsGroup := admin.Group("/metrics")
				{
					metricsGroup.GET("/realtime", cfg.MetricsHandler.GetRealtimeMetrics)
					metricsGroup.GET("/system", cfg.MetricsHandler.GetSystemMetrics)
					metricsGroup.GET("/live-exams", cfg.MetricsHandler.GetLiveExams)
					metricsGroup.GET("/traffic-history", cfg.MetricsHandler.GetTrafficHistory)
					metricsGroup.GET("/forms/:form_id", cfg.MetricsHandler.GetFormMetrics)
				}
			}

			// 8. Superadmin Exclusive 
			superadmin := protected.Group("/superadmin")
			superadmin.Use(middleware.RequireRole(domain.RoleSuperAdmin))
			{
				superadmin.POST("/create-admin", cfg.AdminHandler.CreateAdmin)
				superadmin.GET("/list-admin", cfg.AdminHandler.ListAdmins)
			}
		}
	}

	return r
}
