package models

type Course struct {
	CourseId string `json:"courseId"`
	Title    string `json:"title"`
	Price    int    `json:"price"`
	Length   int    `json:"length"`
	Enrolled int    `json:"enrolled"`
	Image    string `json:"image"`
	ImageUrl string `json:"imageUrl"`
}

type Enrollment struct {
	UserID string `json:"userId"`
	Course Course `json:"course"`
}
