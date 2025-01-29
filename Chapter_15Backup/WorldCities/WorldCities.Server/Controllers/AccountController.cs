using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WorldCities.Server.Data;
using WorldCities.Server.Data.Models;

namespace WorldCities.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        /* For testing.
        /* user@email.com, Sampl3Pa$$_User
        * admin@email.com,Sampl3Pa$$_Admin
        */

        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;

        public AccountController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            JwtHandler jwtHandler)
        {
            _context = context;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            var user = await _userManager.FindByNameAsync(loginRequest.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
                return Unauthorized(new LoginResult()
				{ 
                    Success = false, 
                    Message = "Invalid Email or Password." 
                });
            var secToken = await _jwtHandler.GetTokenAsync(user);

            string jwt = string.Empty;
            try
            {
                // Original
                // var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
                jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            return Ok(new LoginResult()
			{ 
                Success = true,
                Message = "Login successful",
                Token = jwt
            });
        }
    }
}
