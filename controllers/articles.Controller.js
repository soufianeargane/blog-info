const modelsArticles = require("../models/article.models");
const unlink = require("../helpers/imageHelper");
const validation = require("../requests/requestArticle");

class ArticleController {
  static errorMessage = null;
  static successMessage = null;

  static async index(req, res) {
    try {
      let loggedInUser = req.cookies.loggedIn_user;
      const articles = await modelsArticles.getAll();
      ArticleController.successMessage = null;

      res.render("article/AllArticle", {
        articles,
        successMessage: ArticleController.successMessage,
        loggedInUser: loggedInUser,
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(404).send("Internal Server Error");
    }
  }

  static async show(req, res) {
    try {
      const article = await modelsArticles.show(req, res);
      res.render("article/showArticle", { article });
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(404).send("Internal Server Error");
    }
  }

  static async add(req, res) {
    try {
      ArticleController.errorMessage = null;
      res.render("article/addArticle", {
        errorMessage: ArticleController.errorMessage,
      });
    } catch (error) {
      console.error("Error fetching articles:", { error });
      return res.status(404).send("Internal Server Error");
    }
  }

  static async store(req, res) {
    try {
      const check = validation.validateInput(req);

      const csrfToken = req.body._csrf;
      const csrfCookie = req.cookies.csrfToken;
      if (csrfToken !== csrfCookie) {
        return res.send("CSRF token is invalid");
      }

      if (check.error) {
        ArticleController.errorMessage = "All is required";
        return res.redirect("/article/dashborad");
      }

      await modelsArticles.create(req);
      ArticleController.successMessage = "Article Added Successfully";
      ArticleController.errorMessage = null;
      return res.redirect("/article/dashborad");
    } catch (error) {
      ArticleController.errorMessage = "All is required";
      return res.redirect("/article/dashborad");
    }
  }

  static async edit(req, res) {
    try {
      const article = await modelsArticles.show(req, res);
      res.render("article/editArticle", { article });
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(404).send("Internal Server Error");
    }
  }

  static async update(req, res) {
    try {
      const csrfToken = req.body._csrf;
      const csrfCookie = req.cookies.csrfToken;
      if (csrfToken !== csrfCookie) {
        return res.send("CSRF token is invalid");
      }

      if (!req.file) {
        req.body.image = req.body.old_image;
      } else {
        req.body.image = req.file.filename;
        await unlink.unlinkimage(req.body.old_image);
      }

      const articles = await modelsArticles.update(req);
      ArticleController.successMessage = "Article updated Successfully";
      return res.redirect("/article/dashborad");
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(404).send("Internal Server Error");
    }
  }

  static async delete(req, res) {
    try {
      const csrfToken = req.body._csrf;
      const csrfCookie = req.cookies.csrfToken;
      if (csrfToken !== csrfCookie) {
        return res.send("CSRF token is invalid");
      }

      const article = await modelsArticles.delete(req);
      await unlink.unlinkimage(article.image);
      ArticleController.successMessage = "Article Deleted Successfully";
      return res.redirect("/article/dashborad");
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(404).send("Internal Server Error");
    }
  }

  static async dashboard(req, res) {
    const articles = await modelsArticles.getArticleUser(req);
    return res.render("article/dashboard", {
      articles,
      successMessage: ArticleController.successMessage,
      errorMessage: ArticleController.errorMessage,
    });
  }
}

module.exports = {
  index: ArticleController.index,
  show: ArticleController.show,
  add: ArticleController.add,
  store: ArticleController.store,
  edit: ArticleController.edit,
  update: ArticleController.update,
  delete: ArticleController.delete,
  dashboard: ArticleController.dashboard,
  errorMessage: ArticleController.errorMessage,
  successMessage: ArticleController.successMessage,
};
