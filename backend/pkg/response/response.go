package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func Error(c *gin.Context, statusCode int, message string, err interface{}) {
	var errDetails interface{}
	if e, ok := err.(error); ok {
		errDetails = e.Error()
	} else {
		errDetails = err
	}

	c.JSON(statusCode, APIResponse{
		Success: false,
		Message: message,
		Errors:  errDetails,
	})
}

func OK(c *gin.Context, message string, data interface{}) {
	Success(c, http.StatusOK, message, data)
}

func Created(c *gin.Context, message string, data interface{}) {
	Success(c, http.StatusCreated, message, data)
}

func BadRequest(c *gin.Context, message string, err interface{}) {
	Error(c, http.StatusBadRequest, message, err)
}

func Unauthorized(c *gin.Context, message string, err interface{}) {
	Error(c, http.StatusUnauthorized, message, err)
}

func Forbidden(c *gin.Context, message string, err interface{}) {
	Error(c, http.StatusForbidden, message, err)
}

func NotFound(c *gin.Context, message string, err interface{}) {
	Error(c, http.StatusNotFound, message, err)
}

func InternalServerError(c *gin.Context, message string, err interface{}) {
	Error(c, http.StatusInternalServerError, message, err)
}
